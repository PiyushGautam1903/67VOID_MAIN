
import { useState } from "react";
import SearchInput from "@/components/SearchInput";
import FundResults from "@/components/FundResults";
import FundDetail from "@/components/FundDetail";
import Header from "@/components/Header";
import AboutPage from "@/components/AboutPage";
import { SearchResult, ModelSearchResponse } from "@/types/fund";
import { handleFinancialQuery } from "@/services/searchService";
import { toast } from "@/components/ui/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFund, setSelectedFund] = useState<SearchResult | null>(null);
  const [modelResponse, setModelResponse] = useState<ModelSearchResponse | undefined>(undefined);
  const [isNaturalLanguageQuery, setIsNaturalLanguageQuery] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setResults([]);
      return;
    }
    
    setIsLoading(true);
    try {
      // Use our enhanced unified query handler that can handle both regular searches
      // and financial questions
      const searchResults = await handleFinancialQuery(query);
      setResults(searchResults);
      
      // Check if this is a financial question with direct answer
      const hasDirectAnswer = searchResults.some(result => result.answerToQuery);
      
      // Check if this is a natural language query
      const isNL = query.length > 15 && 
                  (query.toLowerCase().startsWith("what") || 
                   query.toLowerCase().startsWith("how") || 
                   query.toLowerCase().startsWith("can") ||
                   query.toLowerCase().startsWith("is") ||
                   query.toLowerCase().startsWith("should") ||
                   query.toLowerCase().startsWith("tell") ||
                   query.toLowerCase().startsWith("does") ||
                   query.includes("?"));
      
      setIsNaturalLanguageQuery(isNL);
      
      // Show appropriate toast based on results
      if (hasDirectAnswer) {
        toast({
          title: "Question Answered",
          description: "Found specific information for your question",
          duration: 3000,
        });
      } else if (isNL) {
        toast({
          title: "Natural Language Query Processed",
          description: "We've analyzed your request and found matching funds",
          duration: 3000,
        });
      } else if (searchResults.length === 0) {
        toast({
          title: "No matches found",
          description: "Try a different search term or check your spelling",
          variant: "destructive",
        });
      }
      
    } catch (error) {
      console.error("Search error:", error);
      toast({
        title: "Search Error",
        description: "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectFund = (result: SearchResult) => {
    setSelectedFund(result);
  };

  const handleCloseFundDetail = () => {
    setSelectedFund(null);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      {activeTab === "search" ? (
        <main className="flex-1 container mx-auto py-8 px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-bold mb-4 text-white">FunStocks AI</h1>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto mb-8">
                Find the right mutual fund instantly, even with natural language queries
              </p>
              
              <div className="flex justify-center mb-8">
                <SearchInput 
                  onSearch={handleSearch} 
                  isLoading={isLoading} 
                />
              </div>
              
              <FundResults 
                results={results} 
                isLoading={isLoading} 
                onSelectFund={handleSelectFund}
                searchQuery={searchQuery}
                modelResponse={modelResponse}
                isNaturalLanguageQuery={isNaturalLanguageQuery}
              />
            </div>
          </div>
          
          {selectedFund && (
            <FundDetail 
              fund={selectedFund.fund} 
              query={searchQuery}
              open={!!selectedFund} 
              onClose={handleCloseFundDetail} 
            />
          )}
        </main>
      ) : (
        <AboutPage />
      )}
      
      <footer className="py-4 border-t border-gray-800 text-center text-sm text-gray-400">
        <div className="container mx-auto">
          FunStocks AI - Demo Project 2025
        </div>
      </footer>
    </div>
  );
};

export default Index;
