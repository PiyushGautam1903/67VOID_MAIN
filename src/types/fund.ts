
// Define types for the fund database

export interface Fund {
  id?: string;
  name: string;
  shortName?: string;
  fundHouse?: string;
  category?: string;
  subCategory?: string;
  assetClass?: string;
  sector?: string;
  risk?: "Low" | "Moderate" | "High";
  nav?: number;
  aum?: number;
  expenseRatio?: number;
  oneYearReturn?: number;
  threeYearReturn?: number;
  fiveYearReturn?: number;
  lastMonthReturn?: number;
  sixMonthReturn?: number;
  growthOptionNav?: number;
  dividendOption?: string;
  dividendFrequency?: string;
  minInvestment?: number;
  lockInPeriod?: string;
  switchOption?: boolean;
  volatility?: string;
  benchmarkIndex?: string;
  sharpeRatio?: number;
  amfiRating?: string;
  assetAllocation?: Record<string, number>;
  portfolioHoldings?: { name: string; percentage: number }[];
  redemptionTerms?: string;
  exitLoad?: string;
  investmentObjective?: string;
  fundManager?: string;
  analystRating?: string;
  
  // New fields based on the provided format
  internalSecurityId?: number;
  price?: number;
  assetType?: string;
  riskOMeter?: string;
  "1YReturns"?: number;
  "3YReturns"?: number;
  "5YReturns"?: number | null;
}

export interface Stock {
  id?: string;
  name: string;
  ticker?: string;
  sector?: string;
  industry?: string;
  currentPrice?: number;
  previousClose?: number;
  dayChange?: number;
  dayChangePercentage?: number;
  marketCap?: number;
  volume?: number;
  peRatio?: number;
  dividendYield?: number;
  
  // New fields based on the provided format
  finCode?: number;
  price?: number;
  ttmpe?: number;
  dividendPerShare?: number;
}

export interface MutualFundHolding {
  fundId?: string;
  stockId?: string;
  percentage?: number;
  shareCount?: number;
  value?: number;
  changeFromLastReport?: number;
  
  // New fields based on the provided format
  srNo?: number;
  asset?: string;
  sector?: string;
  category?: string;
  marketValue?: number;
  parentInternalSecurityId?: number;
  noShares?: number;
  assetType?: string;
}

export interface SearchResult {
  fund: Fund;
  score: number;
  matchReason?: string;
  answerToQuery?: string | null;
}

export interface ModelConfig {
  modelId: string;
  quantized: boolean;
  enableWebGPU: boolean;
}

export interface ModelSearchResponse {
  modelUsed: string;
  timeTaken: number;
  inputTokens?: number;
  outputTokens?: number;
}

export interface DatabaseStructure {
  mutualFundsData: Fund[];
  stocksData: Stock[];
  mutualFundHoldingsData: MutualFundHolding[];
}

// Add additional fund aliases for better matching
export interface FundAlias {
  alias: string;
  fundId: string;
}
