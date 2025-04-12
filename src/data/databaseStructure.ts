
import { DatabaseStructure } from '@/types/fund';
import { additionalFunds } from './additionalFunds';
import { sampleFunds } from './sampleFunds';
import { userMutualFundsData } from './userMutualFundsData';
import { userStocksData } from './userStocksData';
import { userMutualFundHoldingsData } from './userMutualFundHoldingsData';

// This structure holds the actual data that will be populated by the user
export const databaseStructure: DatabaseStructure = {
  mutualFundsData: [...additionalFunds, ...sampleFunds, ...userMutualFundsData], // Combine all funds
  stocksData: [...userStocksData],
  mutualFundHoldingsData: [...userMutualFundHoldingsData]
};

// Placeholder examples for mutual funds data
export const mutualFundsData = `
// Paste your mutual funds JSON data in the src/data/userMutualFundsData.ts file
// This should be an array of Fund objects as defined in types/fund.ts
// Example:
[
  {
    "name": "SBI Fixed Maturity Plan (FMP) - Series 78 (1170 Days)",
    "category": "Debt Schemes",
    "internalSecurityId": 633423598,
    "aum": 124.44,
    "price": 11.7469,
    "assetType": "Debt",
    "riskOMeter": "Low to Moderate",
    "nav": 11.7469,
    "1YReturns": 8.0800831746207,
    "3YReturns": 17.469,
    "5YReturns": null,
    "fundHouse": "SBI Mutual Fund"
  }
]
`;

// Placeholder examples for stocks data
export const stocksData = `
// Paste your stocks JSON data in the src/data/userStocksData.ts file
// This should be an array of Stock objects as defined in types/fund.ts
// Example:
[
  {
    "finCode": 123732,
    "name": "Ecoboard Industries Ltd.",
    "sector": "Materials",
    "industry": "Wood & Wood Products",
    "marketCap": 53.41,
    "price": 29.95,
    "ttmpe": 0,
    "dividendPerShare": 0
  }
]
`;

// Placeholder examples for mutual fund holdings data
export const mutualFundHoldingsData = `
// Paste your mutual fund holdings JSON data in the src/data/userMutualFundHoldingsData.ts file
// This should be an array of MutualFundHolding objects as defined in types/fund.ts
// Example:
[
  {
    "srNo": 11,
    "asset": "Debt",
    "sector": "Others",
    "category": "Small Cap",
    "marketValue": 3838.8322,
    "parentInternalSecurityId": 1133009262,
    "noShares": 3800,
    "assetType": "Corporate Debt"
  }
]
`;
