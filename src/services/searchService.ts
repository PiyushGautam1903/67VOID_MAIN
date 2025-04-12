
import { Fund, SearchResult, ModelSearchResponse } from '@/types/fund';
import { databaseStructure } from '@/data/databaseStructure';
import { sampleFunds } from '@/data/sampleFunds';
import { isFinancialQuestion, matchQuestionToFund, processFinancialQuestion, fundNameMapping } from './financialQuestionService';

// Search for funds matching the query
export async function searchFunds(query: string): Promise<SearchResult[]> {
  // Get all funds from all sources and ensure uniqueness
  const uniqueFunds = removeDuplicateFunds([
    ...databaseStructure.mutualFundsData,
    ...sampleFunds
  ]);
  
  if (!query.trim()) {
    return [];
  }
  
  // Regular search logic
  const searchTerms = query.toLowerCase().split(/\s+/);
  
  const results = uniqueFunds
    .map(fund => {
      const score = calculateSearchScore(fund, searchTerms);
      return { fund, score, matchReason: explainMatch(fund, searchTerms) };
    })
    .filter(result => result.score > 0.1) // Filter out very low scores
    .sort((a, b) => b.score - a.score); // Sort by score descending
  
  // Take top 10 results
  return results.slice(0, 10);
}

// Helper to remove duplicate funds by ID or name if ID is not available
function removeDuplicateFunds(funds: Fund[]): Fund[] {
  const uniqueMap = new Map<string, Fund>();
  
  for (const fund of funds) {
    const key = fund.id || fund.internalSecurityId?.toString() || fund.name;
    if (key && !uniqueMap.has(key)) {
      uniqueMap.set(key, fund);
    }
  }
  
  return Array.from(uniqueMap.values());
}

// Calculate a search score for a fund given search terms
function calculateSearchScore(fund: Fund, searchTerms: string[]): number {
  // Create a searchable text from fund properties
  const fundText = [
    fund.name,
    fund.shortName,
    fund.fundHouse,
    fund.category,
    fund.subCategory,
    fund.assetClass,
    fund.sector,
    fund.assetType
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  
  // Calculate match scores for each term
  const termScores = searchTerms.map(term => {
    // Exact match in the full fund text
    if (fundText.includes(term)) {
      return 1;
    }
    
    // Check for substring matches in individual fields
    if (fund.name?.toLowerCase().includes(term)) {
      return 0.9;
    }
    
    if (fund.shortName?.toLowerCase().includes(term)) {
      return 0.85;
    }
    
    if (fund.fundHouse?.toLowerCase().includes(term)) {
      return 0.7;
    }
    
    if (fund.category?.toLowerCase().includes(term)) {
      return 0.6;
    }
    
    if (fund.sector?.toLowerCase().includes(term)) {
      return 0.5;
    }
    
    // Fuzzy matching for typos (very simplified)
    if (levenshteinDistance(fund.name?.toLowerCase() || '', term) <= 2) {
      return 0.4;
    }
    
    if (levenshteinDistance(fund.shortName?.toLowerCase() || '', term) <= 2) {
      return 0.35;
    }
    
    return 0;
  });
  
  // Calculate a weighted average score
  if (termScores.length === 0) return 0;
  
  const totalScore = termScores.reduce((sum, score) => sum + score, 0);
  return totalScore / termScores.length;
}

// Calculate Levenshtein distance for fuzzy matching
function levenshteinDistance(a: string, b: string): number {
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }
  
  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // deletion
        matrix[j - 1][i] + 1, // insertion
        matrix[j - 1][i - 1] + substitutionCost // substitution
      );
    }
  }
  
  return matrix[b.length][a.length];
}

// Generate an explanation for why a fund matched the search
export function explainMatch(fund: Fund, searchTerms: string[]): string {
  const matches: string[] = [];
  
  // Check name match
  if (fund.name && searchTerms.some(term => fund.name.toLowerCase().includes(term))) {
    matches.push(`name contains "${searchTerms.find(term => fund.name.toLowerCase().includes(term))}"`);
  }
  
  // Check short name match
  if (fund.shortName && searchTerms.some(term => fund.shortName.toLowerCase().includes(term))) {
    matches.push(`fund alias contains "${searchTerms.find(term => fund.shortName.toLowerCase().includes(term))}"`);
  }
  
  // Check fund house match
  if (fund.fundHouse && searchTerms.some(term => fund.fundHouse.toLowerCase().includes(term))) {
    matches.push(`from ${fund.fundHouse}`);
  }
  
  // Check category match
  if (fund.category && searchTerms.some(term => fund.category.toLowerCase().includes(term))) {
    matches.push(`is a ${fund.category} fund`);
  }
  
  // Check sector match
  if (fund.sector && searchTerms.some(term => fund.sector.toLowerCase().includes(term))) {
    matches.push(`invests in ${fund.sector} sector`);
  }
  
  // If we have multiple matches, format them nicely
  if (matches.length > 1) {
    const lastMatch = matches.pop();
    return `This fund ${matches.join(', ')} and ${lastMatch}.`;
  } else if (matches.length === 1) {
    return `This fund ${matches[0]}.`;
  }
  
  // Fallback for fuzzy matches
  for (const term of searchTerms) {
    if (levenshteinDistance(fund.name?.toLowerCase() || '', term) <= 2) {
      return `This fund's name is similar to your search.`;
    }
  }
  
  return 'This fund partially matches your search criteria.';
}

// Unified handler for both regular searches and financial questions
export async function handleFinancialQuery(query: string): Promise<SearchResult[]> {
  const lowerQuery = query.toLowerCase();
  
  // Check for pattern match from the training data
  let matchedFundName = null;
  
  // First try exact match with the fund name mapping
  for (const [pattern, fundName] of Object.entries(fundNameMapping)) {
    if (lowerQuery.includes(pattern.toLowerCase())) {
      matchedFundName = fundName;
      break;
    }
  }
  
  // If we have a matched fund name from the mapping
  if (matchedFundName) {
    const matchedFund = [...databaseStructure.mutualFundsData, ...sampleFunds].find(
      fund => fund.name === matchedFundName || 
              fund.shortName === matchedFundName
    );
    
    if (matchedFund) {
      // Check if this looks like a financial question
      if (isFinancialQuestion(query)) {
        // Process the financial question to get the answer
        const answer = await processFinancialQuestion(query, matchedFund);
        
        return [{
          fund: matchedFund,
          score: 0.95,
          matchReason: "This fund specifically matches your question.",
          answerToQuery: answer || `Information about ${matchedFund.name} for your query is not available.`
        }];
      } else {
        // Regular search but with perfect match
        return [{
          fund: matchedFund,
          score: 0.9,
          matchReason: "This fund matches your search terms."
        }];
      }
    }
  }
  
  // If we reach here, try the regular search matching logic
  if (isFinancialQuestion(query)) {
    const matchedFund = matchQuestionToFund(query);
    
    if (matchedFund) {
      // Process the financial question to get the answer
      const answer = await processFinancialQuestion(query, matchedFund);
      
      return [{
        fund: matchedFund,
        score: 0.95,
        matchReason: "This fund specifically matches your question.",
        answerToQuery: answer || `Information about ${matchedFund.name} for your query is not available.`
      }];
    }
  }
  
  // Fall back to regular search if we couldn't identify the fund or it's not a financial question
  return searchFunds(query);
}
