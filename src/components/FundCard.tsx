
import { Fund } from "@/types/fund";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, TrendingDown } from "lucide-react";

interface FundCardProps {
  fund: Fund;
  score: number;
  onClick: () => void;
}

const FundCard = ({ fund, score, onClick }: FundCardProps) => {
  const performanceClass = (value: number | undefined) => {
    if (!value) return "text-gray-400";
    return value >= 0 ? "text-finance-positive" : "text-finance-negative";
  };

  return (
    <Card 
      className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer bg-gray-900 border-gray-800"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg mb-1 pr-2 text-white">{fund.name}</h3>
              <Badge 
                variant={score > 0.7 ? "default" : "outline"} 
                className="whitespace-nowrap"
              >
                {(score * 100).toFixed(0)}% match
              </Badge>
            </div>
            
            <p className="text-gray-400 text-sm mb-3">
              {fund.fundHouse} • {fund.category} 
              {fund.sector ? ` • ${fund.sector}` : ''}
            </p>
            
            <div className="flex flex-wrap gap-2 mt-2 mb-3">
              <Badge variant="outline" className="bg-finance-primary/10 text-finance-primary border-finance-primary/30">
                {fund.assetClass}
              </Badge>
              {fund.risk && (
                <Badge variant={fund.risk === "High" ? "destructive" : fund.risk === "Low" ? "secondary" : "outline"}>
                  {fund.risk} Risk
                </Badge>
              )}
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col gap-4 md:gap-2 md:min-w-32">
            <div>
              <p className="text-xs text-gray-400">1Y Returns</p>
              <div className="flex items-center gap-1">
                {(fund.oneYearReturn || 0) >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-finance-positive" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-finance-negative" />
                )}
                <span className={`font-medium ${performanceClass(fund.oneYearReturn)}`}>
                  {fund.oneYearReturn ? `${fund.oneYearReturn.toFixed(2)}%` : 'N/A'}
                </span>
              </div>
            </div>
            
            <div>
              <p className="text-xs text-gray-400">NAV</p>
              <p className="font-medium text-white">₹{fund.nav?.toFixed(2) || 'N/A'}</p>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <span className="text-xs text-primary flex items-center hover:underline">
            View details <ArrowUpRight className="h-3 w-3 ml-1" />
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default FundCard;
