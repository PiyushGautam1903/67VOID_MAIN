
import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  onSearch: (query: string) => void;
  isLoading: boolean;
}

const SearchInput = ({ onSearch, isLoading }: SearchInputProps) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  
  // Common search examples from our expanded dataset
  const searchExamples = [
    "icici infra", 
    "sbi tech", 
    "hdfc small cap", 
    "kotak emerging",
    "nippon pharma",
    "axis elss",
    "tata banking"
  ];
  
  // Natural language query examples
  const nlQueryExamples = [
    "What is the NAV of ICICI Prudential Transportation and Logistics Fund?",
    "What's the growth option NAV of UTI Money Market Fund?",
    "What was the last month's return of Canara Robeco ELSS Tax Saver?",
    "Is Kotak Focused Equity Fund better than other similar funds?",
    "Tell me the expense ratio of Tata BSE Select Business Groups Index Fund.",
    "Can I start an SIP with UTI Money Market Fund?",
    "What are the recent returns for Bandhan Credit Risk Fund?",
    "Should I consider investing in Aditya Birla Sun Life Pharma & Healthcare Fund?",
    "What's the dividend frequency for ICICI Prudential Transportation and Logistics Fund?",
    "Does Groww Nifty EV & New Age Automotive ETF FOF have any lock-in period?",
    "How has Union Overnight Fund performed over the last year?",
    "What's the Sharpe Ratio of Kotak Focused Equity Fund?",
    "Tell me about the portfolio holdings of Canara Robeco ELSS Tax Saver.",
    "Is it beneficial to hold UTI Money Market Fund long-term?",
    "What's the risk associated with Groww Nifty EV & New Age Automotive ETF FOF?"
  ];

  useEffect(() => {
    // Enhanced suggestion logic based on user input
    if (query.length > 0) { // Show suggestions as soon as user types anything
      // Check if this looks like the beginning of a natural language query
      if (query.toLowerCase().startsWith("what") || 
          query.toLowerCase().startsWith("how") || 
          query.toLowerCase().startsWith("can") ||
          query.toLowerCase().startsWith("is") ||
          query.toLowerCase().startsWith("should") ||
          query.toLowerCase().startsWith("tell") ||
          query.toLowerCase().startsWith("does") ||
          query.toLowerCase().includes("?")) {
        
        const matchedNLSuggestions = nlQueryExamples
          .filter(example => example.toLowerCase().startsWith(query.toLowerCase()) || 
                            example.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 5);
        
        setSuggestions(matchedNLSuggestions);
      } else {
        // Regular fund search suggestions
        const matchedSuggestions = searchExamples
          .filter(example => {
            // More aggressive fuzzy matching for suggestions
            return example.toLowerCase().includes(query.toLowerCase()) || 
                  getEditDistance(query.toLowerCase(), example.toLowerCase()) <= 3;
          })
          .slice(0, 5); // Show more suggestions
        
        setSuggestions(matchedSuggestions);
      }
    } else {
      setSuggestions([]);
    }
  }, [query]);
  
  // Improved edit distance calculation with higher emphasis on common typos
  const getEditDistance = (a: string, b: string): number => {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
    
    for (let i = 0; i <= b.length; i++) {
      matrix[i][0] = i;
    }
    
    for (let j = 0; j <= a.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        let cost = a[j - 1] === b[i - 1] ? 0 : 1;
        
        // Special handling for double letter typos (like "nipon" vs "nippon")
        if (i > 1 && j > 1 && 
            b[i-1] === a[j-2] && b[i-2] === a[j-1]) {
          cost = Math.min(cost, 0.5); // Lower cost for transpositions (makes "nipon" closer to "nippon")
        }
        
        // Special handling for missing double letters
        if (i > 1 && j > 0 && b[i-1] === b[i-2] && b[i-1] === a[j-1]) {
          cost = Math.min(cost, 0.5); // Lower cost for missing double letters
        }
        
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Deletion
          matrix[i][j - 1] + 1,      // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }
    
    return matrix[b.length][a.length];
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query);
      setSuggestions([]); // Clear suggestions after search
    }
  };

  const handleClear = () => {
    setQuery("");
    onSearch("");
    setSuggestions([]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    onSearch(suggestion);
    setSuggestions([]);
  };

  return (
    <form onSubmit={handleSubmit} className="relative w-full max-w-3xl">
      <div className="relative flex items-center">
        <Search className="absolute left-3 h-5 w-5 text-gray-400" />
        <Input
          type="text"
          placeholder="Search funds or ask questions like 'What is the NAV of ICICI Prudential Fund?'"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-16 py-6 text-base rounded-full bg-gray-900 border-gray-700 shadow-md focus:ring-2 focus:ring-primary focus:border-primary text-white"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-24 p-1 rounded-full text-gray-400 hover:text-gray-200 focus:outline-none"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <Button
          type="submit"
          disabled={isLoading || !query.trim()}
          className="absolute right-2 rounded-full py-2 px-4 bg-primary hover:bg-primary/90"
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </div>
      
      {/* Suggestions dropdown */}
      {suggestions.length > 0 && (
        <div className="absolute mt-1 w-full bg-gray-900 shadow-lg rounded-md border border-gray-700 z-10">
          <ul className="py-1">
            {suggestions.map((suggestion, index) => (
              <li 
                key={index}
                className="px-4 py-2 hover:bg-gray-800 cursor-pointer flex items-center text-gray-200"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <Search className="h-4 w-4 text-gray-400 mr-2" />
                <span>{suggestion}</span>
                {suggestion.length < 20 && getEditDistance(query.toLowerCase(), suggestion.toLowerCase()) <= 3 && 
                  getEditDistance(query.toLowerCase(), suggestion.toLowerCase()) > 0 && (
                  <span className="ml-2 text-xs bg-yellow-900 px-2 py-0.5 rounded text-yellow-200">
                    Did you mean?
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </form>
  );
};

export default SearchInput;
