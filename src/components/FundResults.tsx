
import { ModelSearchResponse, SearchResult } from "@/types/fund";
import FundCard from "./FundCard";
import { FileText, Clock, Check, MessageCircle } from "lucide-react";

interface FundResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelectFund: (result: SearchResult) => void;
  searchQuery: string;
  modelResponse?: ModelSearchResponse;
  isNaturalLanguageQuery?: boolean;
}

const FundResults = ({ 
  results, 
  isLoading, 
  onSelectFund, 
  searchQuery,
  modelResponse,
  isNaturalLanguageQuery = false
}: FundResultsProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 mt-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-44 rounded-lg bg-gray-800 animate-pulse" />
        ))}
      </div>
    );
  }

  if (results.length === 0 && searchQuery) {
    return (
      <div className="text-center py-10 text-white">
        <h3 className="text-lg font-semibold">No funds found</h3>
        <p className="text-gray-400">Try a different search term</p>
      </div>
    );
  }

  // Check if any result has a direct answer to a financial question
  const hasFinancialAnswer = results.some(result => result.answerToQuery);

  return (
    <div className="space-y-6 mt-6">
      {isNaturalLanguageQuery && !hasFinancialAnswer && (
        <div className="bg-blue-900/50 p-4 rounded-lg mb-4 text-sm text-blue-200">
          <p className="font-medium">Natural Language Query Results</p>
          <p>Showing funds matching your description</p>
        </div>
      )}
      
      {hasFinancialAnswer && (
        <div className="bg-green-900/50 p-4 rounded-lg mb-4 text-sm text-green-200">
          <p className="font-medium">Financial Question Answered</p>
          <p>Found specific information for your question</p>
        </div>
      )}
      
      {modelResponse && (
        <div className="bg-gray-800 p-3 rounded-lg text-xs flex flex-wrap gap-2 justify-between items-center text-gray-300">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>Model: {modelResponse.modelUsed.split('/').pop()}</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>Search time: {modelResponse.timeTaken.toFixed(2)}ms</span>
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        {results.map((result) => (
          <div key={result.fund.id} className="flex flex-col gap-1">
            {/* Display direct answer to financial question if available */}
            {result.answerToQuery && (
              <div className="bg-gray-800 border border-green-800 px-4 py-3 rounded-lg text-white mb-1 flex items-start gap-2">
                <MessageCircle className="h-5 w-5 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p>{result.answerToQuery}</p>
                </div>
              </div>
            )}
            
            <FundCard
              fund={result.fund}
              score={result.score}
              onClick={() => onSelectFund(result)}
            />
            
            {/* Match reason explanation section */}
            {result.matchReason && !result.answerToQuery && (
              <div className="bg-gray-900 border border-gray-800 px-3 py-2 rounded-md text-sm flex items-start gap-2">
                <Check className="h-4 w-4 text-green-400 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-gray-400">Match reason: </span>
                  <span className="text-gray-200">{result.matchReason}</span>
                  <span className="ml-2 bg-gray-800 text-primary px-1.5 py-0.5 text-xs rounded">
                    {(result.score * 100).toFixed(0)}% match
                  </span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default FundResults;
