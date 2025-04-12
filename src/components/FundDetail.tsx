
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Fund } from "@/types/fund";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, TrendingUp, TrendingDown, DollarSign, Percent } from "lucide-react";

interface FundDetailProps {
  fund: Fund | null;
  query: string;
  open: boolean;
  onClose: () => void;
}

const FundDetail = ({ fund, query, open, onClose }: FundDetailProps) => {
  if (!fund) return null;
  
  // Calculate performance styles
  const getReturnStyle = (value: number | undefined) => {
    if (value === undefined) return "text-gray-400";
    return value >= 0 ? "text-finance-positive" : "text-finance-negative";
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-gray-900 text-white border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-white">{fund.name}</DialogTitle>
          <div className="flex flex-wrap gap-2 mt-2">
            <Badge variant="outline" className="bg-finance-primary/10 text-finance-primary border-finance-primary/30">
              {fund.fundHouse}
            </Badge>
            <Badge variant="outline" className="bg-finance-secondary/10 text-finance-secondary border-finance-secondary/30">
              {fund.category}
            </Badge>
            {fund.subCategory && (
              <Badge variant="outline" className="border-gray-600">
                {fund.subCategory}
              </Badge>
            )}
            {fund.sector && (
              <Badge variant="outline" className="bg-finance-accent/10 text-finance-accent border-finance-accent/30">
                {fund.sector}
              </Badge>
            )}
            <Badge variant={fund.risk === "High" ? "destructive" : fund.risk === "Low" ? "secondary" : "outline"}>
              {fund.risk} Risk
            </Badge>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-10rem)] pr-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-white">
                <DollarSign className="h-5 w-5 text-finance-primary" />
                Fund Information
              </h3>
              <div className="space-y-4 text-gray-300">
                <div>
                  <p className="text-sm text-gray-400">Net Asset Value (NAV)</p>
                  <p className="font-medium text-white">₹{fund.nav?.toFixed(2) || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Assets Under Management (AUM)</p>
                  <p className="font-medium text-white">₹{fund.aum ? `${fund.aum.toFixed(2)} Cr.` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Expense Ratio</p>
                  <p className="font-medium text-white">{fund.expenseRatio ? `${fund.expenseRatio.toFixed(2)}%` : 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Asset Class</p>
                  <p className="font-medium text-white">{fund.assetClass}</p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold mb-3 flex items-center gap-2 text-white">
                <Percent className="h-5 w-5 text-finance-primary" />
                Performance
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-400">1 Year Return</p>
                  <div className="flex items-center gap-1">
                    {(fund.oneYearReturn || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-finance-positive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-finance-negative" />
                    )}
                    <p className={`font-medium ${getReturnStyle(fund.oneYearReturn)}`}>
                      {fund.oneYearReturn ? `${fund.oneYearReturn.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">3 Year Return</p>
                  <div className="flex items-center gap-1">
                    {(fund.threeYearReturn || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-finance-positive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-finance-negative" />
                    )}
                    <p className={`font-medium ${getReturnStyle(fund.threeYearReturn)}`}>
                      {fund.threeYearReturn ? `${fund.threeYearReturn.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-400">5 Year Return</p>
                  <div className="flex items-center gap-1">
                    {(fund.fiveYearReturn || 0) >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-finance-positive" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-finance-negative" />
                    )}
                    <p className={`font-medium ${getReturnStyle(fund.fiveYearReturn)}`}>
                      {fund.fiveYearReturn ? `${fund.fiveYearReturn.toFixed(2)}%` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6 bg-gray-700" />
          
          <div className="mb-4">
            <a href="#" className="inline-flex items-center text-finance-primary hover:underline">
              <span>View fund prospectus</span>
              <ArrowUpRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FundDetail;
