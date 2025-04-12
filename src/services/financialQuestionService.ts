
import { Fund, SearchResult, Stock, MutualFundHolding } from '@/types/fund';
import { databaseStructure } from '@/data/databaseStructure';
import { explainMatch } from './searchService';

// Map of question patterns to their handler functions
type QuestionHandler = (
  query: string,
  fund: Fund,
  stocksData: Stock[],
  holdingsData: MutualFundHolding[]
) => string | null;

// Collection of question patterns and their extractors
interface QuestionPattern {
  patterns: RegExp[];
  handler: QuestionHandler;
}

// This function processes natural language financial questions
export async function processFinancialQuestion(query: string, fund: Fund): Promise<string | null> {
  // Get the stocks and holdings data
  const { stocksData, mutualFundHoldingsData } = databaseStructure;
  
  // Check each question pattern
  for (const pattern of questionPatterns) {
    for (const regex of pattern.patterns) {
      if (regex.test(query.toLowerCase())) {
        return pattern.handler(query.toLowerCase(), fund, stocksData, mutualFundHoldingsData);
      }
    }
  }
  
  // If no specific pattern is found, provide a generic response
  return null;
}

// Collection of question patterns to recognize
const questionPatterns: QuestionPattern[] = [
  // NAV related questions
  {
    patterns: [
      /what is the nav of/i,
      /current nav/i,
      /nav for/i,
      /provide the( recent)? nav/i,
      /tell me the latest nav/i,
      /recent nav trend/i,
      /can you provide the recent nav/i
    ],
    handler: (query, fund) => {
      if (fund.nav) {
        return `The current NAV of ${fund.name} is ₹${fund.nav.toFixed(2)}.`;
      }
      return null;
    }
  },
  
  // Growth option NAV questions
  {
    patterns: [
      /growth option nav/i,
      /nav of growth option/i,
      /what'?s the growth option nav/i
    ],
    handler: (query, fund) => {
      if (fund.growthOptionNav) {
        return `The growth option NAV of ${fund.name} is ₹${fund.growthOptionNav.toFixed(2)}.`;
      }
      return null;
    }
  },
  
  // Returns related questions
  {
    patterns: [
      /recent returns for/i,
      /performance of/i,
      /how has .* performed/i,
      /last month'?s return/i,
      /what'?s the performance/i,
      /what are the recent returns/i,
      /compare cagr/i,
      /returns of .* vs nifty/i
    ],
    handler: (query, fund) => {
      if (query.includes("month") && fund.lastMonthReturn) {
        return `The last month's return of ${fund.name} was ${fund.lastMonthReturn.toFixed(2)}%.`;
      }
      
      if ((query.includes("6 month") || query.includes("six month") || query.includes("past 6 months")) && fund.sixMonthReturn) {
        return `The 6-month return of ${fund.name} was ${fund.sixMonthReturn.toFixed(2)}%.`;
      }
      
      if (query.includes("year") || query.includes("annual")) {
        if (fund.oneYearReturn) {
          return `The 1-year return of ${fund.name} was ${fund.oneYearReturn.toFixed(2)}%.`;
        }
      }
      
      if (query.includes("vs nifty") && fund.oneYearReturn) {
        return `${fund.name} has ${fund.oneYearReturn > 10 ? 'outperformed' : 'underperformed'} Nifty with returns of ${fund.oneYearReturn.toFixed(2)}% over the past year.`;
      }
      
      // Generic performance response
      if (fund.oneYearReturn) {
        return `${fund.name} has returned ${fund.oneYearReturn.toFixed(2)}% over the past year.`;
      }
      
      return null;
    }
  },
  
  // Dividend related questions
  {
    patterns: [
      /dividend option in/i,
      /provide details about the dividend/i,
      /dividend frequency/i,
      /does .* give regular dividends/i,
      /can you provide details about the dividend option/i,
      /growth or idcw/i,
      /dividend history/i
    ],
    handler: (query, fund) => {
      if (fund.dividendOption && fund.dividendFrequency) {
        return `${fund.name} offers a ${fund.dividendOption} dividend option with ${fund.dividendFrequency} frequency.`;
      }
      
      if (query.includes("give regular dividends")) {
        if (fund.dividendFrequency) {
          return `Yes, ${fund.name} provides dividends on a ${fund.dividendFrequency} basis.`;
        } else {
          return `${fund.name} doesn't provide regular dividends.`;
        }
      }
      
      if (query.includes("growth or idcw")) {
        return `For ${fund.name}, ${fund.risk === "Low" ? "IDCW option may be suitable if you need regular income" : "Growth option may be more tax-efficient for long-term investors"}.`;
      }
      
      if (fund.dividendOption) {
        return `${fund.name} offers a ${fund.dividendOption} dividend option.`;
      }
      
      if (fund.dividendFrequency) {
        return `${fund.name} has a dividend frequency of ${fund.dividendFrequency}.`;
      }
      
      return null;
    }
  },
  
  // SIP related questions
  {
    patterns: [
      /can i start (an|a) sip/i,
      /good investment for sip/i,
      /should i consider investing/i,
      /what'?s the sip minimum/i,
      /is .* a good (option|idea)? for (long term|sip)/i,
      /i want to start an sip in/i,
      /can i invest in .* monthly/i,
      /good idea\?$/i
    ],
    handler: (query, fund) => {
      if (query.includes("is it a good idea") || query.includes("good idea?")) {
        if (fund.risk === "Low") {
          return `Starting an SIP in ${fund.name} could be suitable if you're looking for stable returns with lower volatility.`;
        } else if (fund.risk === "High") {
          return `${fund.name} is a high-risk fund; SIPs can help average your investment cost but prepare for volatility.`;
        } else {
          return `${fund.name} can be considered for SIP investments based on your risk tolerance and investment horizon.`;
        }
      }
      
      if (query.includes("sip minimum")) {
        if (fund.minInvestment) {
          return `The SIP minimum for ${fund.name} is ₹${fund.minInvestment}.`;
        }
        return `${fund.name} typically accepts SIPs starting from ₹500 per month.`;
      }
      
      if (query.includes("can i invest") && query.includes("monthly")) {
        if (fund.assetClass === "Equity" || fund.category?.includes("Open")) {
          return `Yes, you can invest in ${fund.name} through monthly SIP installments.`;
        } else if (fund.category?.includes("FMP") || fund.category?.includes("Fixed Maturity")) {
          return `${fund.name} is a closed-ended fund and typically doesn't allow monthly SIP investments.`;
        }
      }
      
      if (fund.minInvestment) {
        return `You can start an SIP in ${fund.name} with a minimum investment of ₹${fund.minInvestment}.`;
      }
      
      return `${fund.name} is available for SIP investments.`;
    }
  },
  
  // Comparison questions
  {
    patterns: [
      /better than other similar funds/i,
      /outperforming the market/i,
      /better than fd/i,
      /has .* been outperforming/i
    ],
    handler: (query, fund) => {
      if (query.includes("better than fd")) {
        if (fund.oneYearReturn && fund.oneYearReturn > 7) {
          return `${fund.name} has returned ${fund.oneYearReturn.toFixed(2)}% over the past year, which is higher than typical FD rates, but comes with higher risk.`;
        } else {
          return `While ${fund.name} may offer potentially higher returns than FDs over longer periods, it also carries higher risk.`;
        }
      }
      
      if (fund.benchmarkIndex && fund.oneYearReturn) {
        return `${fund.name} has ${fund.oneYearReturn > 10 ? 'outperformed' : 'underperformed'} its benchmark (${fund.benchmarkIndex}) with returns of ${fund.oneYearReturn.toFixed(2)}% over the past year.`;
      }
      
      return null;
    }
  },
  
  // Lock-in period questions
  {
    patterns: [
      /lock-?in period/i,
      /have any lock-?in/i,
      /does .* have (any )?lock-?in/i,
      /any lock-?in period/i
    ],
    handler: (query, fund) => {
      if (fund.category && fund.category.includes("ELSS")) {
        return `${fund.name} is an ELSS fund and has a mandatory lock-in period of 3 years.`;
      }
      
      if (fund.lockInPeriod) {
        return `${fund.name} has a lock-in period of ${fund.lockInPeriod}.`;
      }
      
      if (fund.category && (fund.category.includes("FMP") || fund.category.includes("Fixed Maturity"))) {
        return `${fund.name} is a closed-ended fund designed to be held until maturity.`;
      }
      
      return `${fund.name} does not have any mandatory lock-in period.`;
    }
  },
  
  // Switch option questions
  {
    patterns: [
      /offer a switch option/i,
      /can.*switch/i,
      /does .* offer a switch option/i
    ],
    handler: (query, fund) => {
      if (fund.switchOption === true) {
        return `Yes, ${fund.name} offers a switch option to move between schemes.`;
      }
      if (fund.switchOption === false) {
        return `No, ${fund.name} does not offer a switch option.`;
      }
      
      // For closed-ended funds
      if (fund.category && (fund.category.includes("FMP") || fund.category.includes("Fixed Maturity"))) {
        return `${fund.name} is a closed-ended fund and typically doesn't offer switch options until maturity.`;
      }
      
      return null;
    }
  },
  
  // Long-term investment questions
  {
    patterns: [
      /beneficial to hold .* long-?term/i,
      /good for long-?term/i,
      /is .* a good option for long term/i,
      /investment horizon/i,
      /what'?s the investment horizon/i,
      /can i invest in .* for my retirement/i,
      /can i park surplus money/i
    ],
    handler: (query, fund) => {
      if (query.includes("investment horizon")) {
        if (fund.assetClass === "Equity") {
          return `The recommended investment horizon for ${fund.name} is at least 5-7 years.`;
        } else if (fund.assetClass === "Debt" && fund.category.includes("Short")) {
          return `${fund.name} is suitable for an investment horizon of 1-3 years.`;
        } else if (fund.category.includes("FMP") || fund.category.includes("Fixed Maturity")) {
          const duration = fund.name.match(/\d+\s*(Day|Days|Month|Months|Year|Years)/i);
          return duration ? 
            `${fund.name} has a fixed investment horizon of ${duration[0]}.` : 
            `${fund.name} should be held until maturity for optimal returns.`;
        } else {
          return `${fund.name} is best suited for a ${fund.risk === "Low" ? "short to medium" : "medium to long"}-term investment horizon.`;
        }
      }
      
      if (query.includes("park surplus money") && query.includes("6 months")) {
        if (fund.risk === "Low" && (fund.category.includes("Liquid") || fund.category.includes("Ultra Short") || fund.category.includes("Low Duration"))) {
          return `Yes, ${fund.name} can be suitable for parking surplus money for 6 months.`;
        } else {
          return `${fund.name} may not be the most suitable option for just 6 months; consider a liquid or ultra short-term fund instead.`;
        }
      }
      
      if (query.includes("retirement")) {
        if (fund.assetClass === "Equity" && fund.risk !== "High") {
          return `${fund.name} could be part of a retirement portfolio, but ensure you have a diversified approach based on your retirement timeline.`;
        } else if (fund.category.includes("Retirement") || fund.category.includes("Pension")) {
          return `${fund.name} is specifically designed for retirement planning.`;
        } else {
          return `For retirement investing, consider if ${fund.name} aligns with your time horizon and risk profile.`;
        }
      }
      
      if (fund.assetClass && fund.risk) {
        return `${fund.name} is a ${fund.risk.toLowerCase()} risk ${fund.assetClass.toLowerCase()} fund, making it ${
          fund.assetClass === 'Equity' ? 'potentially suitable' : 'moderately suitable'
        } for long-term investments.`;
      }
      
      return null;
    }
  },
  
  // Expense ratio questions
  {
    patterns: [
      /expense ratio/i,
      /management fee/i,
      /tell me the expense ratio/i,
      /what is the expense ratio/i
    ],
    handler: (query, fund) => {
      if (fund.expenseRatio) {
        return `${fund.name} has an expense ratio of ${fund.expenseRatio.toFixed(2)}%.`;
      }
      return null;
    }
  },
  
  // Risk related questions
  {
    patterns: [
      /risk associated with/i,
      /how risky is/i,
      /volatility of/i,
      /what'?s the risk associated/i,
      /risk level/i,
      /how volatile is/i,
      /how risky is investing in/i,
      /is .* a low-risk fund/i
    ],
    handler: (query, fund) => {
      if (query.includes("low-risk fund")) {
        if (fund.risk === "Low") {
          return `Yes, ${fund.name} is considered a low-risk fund.`;
        } else {
          return `No, ${fund.name} is considered a ${fund.risk?.toLowerCase() || "moderate"} risk fund.`;
        }
      }
      
      if (query.includes("volatile") && query.includes("historically")) {
        if (fund.volatility) {
          return `Historically, ${fund.name} has shown ${fund.volatility.toLowerCase()} volatility.`;
        } else if (fund.risk === "Low") {
          return `${fund.name} has historically shown low volatility, in line with its risk profile.`;
        } else if (fund.risk === "High") {
          return `${fund.name} has shown significant volatility historically, as expected for its higher risk profile.`;
        }
      }
      
      if (fund.risk && fund.volatility) {
        return `${fund.name} has a ${fund.risk.toLowerCase()} risk profile with ${fund.volatility.toLowerCase()} volatility.`;
      }
      
      if (fund.risk) {
        return `${fund.name} has a ${fund.risk.toLowerCase()} risk profile.`;
      }
      
      if (fund.volatility) {
        return `${fund.name} has ${fund.volatility.toLowerCase()} volatility.`;
      }
      
      return null;
    }
  },
  
  // Benchmark questions
  {
    patterns: [
      /benchmark for/i,
      /index it tracks/i,
      /give me the benchmark/i
    ],
    handler: (query, fund) => {
      if (fund.benchmarkIndex) {
        return `The benchmark index for ${fund.name} is ${fund.benchmarkIndex}.`;
      }
      return null;
    }
  },
  
  // Sharpe ratio questions
  {
    patterns: [
      /sharpe ratio/i,
      /risk-?adjusted return/i,
      /what'?s the sharpe ratio/i
    ],
    handler: (query, fund) => {
      if (fund.sharpeRatio) {
        return `${fund.name} has a Sharpe ratio of ${fund.sharpeRatio.toFixed(2)}.`;
      }
      return `Data for Sharpe ratio of ${fund.name} is not available.`;
    }
  },
  
  // AMFI rating questions
  {
    patterns: [
      /rated by amfi/i,
      /amfi rating/i,
      /how is .* rated by amfi/i
    ],
    handler: (query, fund) => {
      if (fund.amfiRating) {
        return `${fund.name} is rated ${fund.amfiRating} by AMFI.`;
      }
      return `AMFI rating for ${fund.name} is not available.`;
    }
  },
  
  // Asset allocation questions
  {
    patterns: [
      /asset allocation/i,
      /how (is|are) .* funds? allocated/i,
      /what'?s the asset allocation/i
    ],
    handler: (query, fund) => {
      if (fund.assetAllocation) {
        const allocations = Object.entries(fund.assetAllocation)
          .filter(([_, value]) => value !== undefined)
          .map(([key, value]) => `${key}: ${value}%`)
          .join(', ');
        
        if (allocations) {
          return `The asset allocation of ${fund.name} is: ${allocations}.`;
        }
      }
      
      // If no specific asset allocation data, provide a generalized response based on fund type
      if (fund.assetClass === "Equity") {
        return `${fund.name} primarily invests in equity securities.`;
      } else if (fund.assetClass === "Debt") {
        return `${fund.name} primarily invests in fixed income securities.`;
      } else if (fund.assetClass === "Hybrid") {
        return `${fund.name} invests in a mix of equity and debt instruments.`;
      }
      
      return null;
    }
  },
  
  // Portfolio holdings questions
  {
    patterns: [
      /portfolio holdings/i,
      /what does .* invest in/i,
      /top holdings/i,
      /tell me about the portfolio holdings/i,
      /what kind of portfolio/i
    ],
    handler: (query, fund, stocksData, holdingsData) => {
      if (fund.portfolioHoldings && fund.portfolioHoldings.length > 0) {
        const topHoldings = fund.portfolioHoldings
          .slice(0, 5)
          .map(h => `${h.name} (${h.percentage.toFixed(2)}%)`)
          .join(', ');
        
        return `Top holdings of ${fund.name} include: ${topHoldings}.`;
      }
      
      if (query.includes("kind of portfolio") && fund.assetClass) {
        if (fund.assetClass === "Equity") {
          return `${fund.name} maintains a portfolio of ${fund.category.toLowerCase()} stocks${fund.sector ? ` with focus on ${fund.sector.toLowerCase()} sector` : ''}.`;
        } else if (fund.assetClass === "Debt") {
          return `${fund.name} maintains a portfolio of ${fund.category.toLowerCase()} debt instruments with focus on ${fund.risk?.toLowerCase() || 'moderate'} risk securities.`;
        }
      }
      
      return `Detailed portfolio holdings information for ${fund.name} is not available.`;
    }
  },
  
  // Redemption terms questions
  {
    patterns: [
      /redemption terms/i,
      /how (can|to) redeem/i,
      /exit load/i,
      /what are the redemption terms/i,
      /details about exit load/i,
      /allow swp/i,
      /systematic withdrawal plan/i
    ],
    handler: (query, fund) => {
      if (query.includes("swp") || query.includes("systematic withdrawal")) {
        if (fund.category && (fund.category.includes("FMP") || fund.category.includes("Fixed Maturity"))) {
          return `${fund.name} is a closed-ended fund and typically doesn't support SWP until maturity.`;
        } else {
          return `Yes, ${fund.name} allows Systematic Withdrawal Plan (SWP) for regular income.`;
        }
      }
      
      if (fund.redemptionTerms) {
        return `Redemption terms for ${fund.name}: ${fund.redemptionTerms}.`;
      }
      
      if (fund.exitLoad) {
        return `${fund.name} has an exit load of ${fund.exitLoad}.`;
      }
      
      // Default response based on fund type
      if (fund.category && (fund.category.includes("FMP") || fund.category.includes("Fixed Maturity"))) {
        return `${fund.name} is a closed-ended fund, meant to be held until maturity.`;
      } else if (fund.category && fund.category.includes("ELSS")) {
        return `${fund.name} has a mandatory 3-year lock-in period, after which there is no exit load.`;
      } else {
        return `Standard redemption terms apply to ${fund.name}. Please check the latest scheme information document for details.`;
      }
    }
  },
  
  // Investment objective questions
  {
    patterns: [
      /investment objective/i,
      /goal of the fund/i,
      /what does .* aim to/i,
      /explain .* objective/i,
      /tell me about the investment objective/i
    ],
    handler: (query, fund) => {
      if (fund.investmentObjective) {
        return `Investment objective of ${fund.name}: ${fund.investmentObjective}.`;
      }
      
      // Generate generic response based on fund type
      if (fund.assetClass === "Equity" && fund.category) {
        return `${fund.name} aims to generate long-term capital appreciation by investing primarily in ${fund.category.toLowerCase()} equities${fund.sector ? ` in the ${fund.sector.toLowerCase()} sector` : ''}.`;
      } else if (fund.assetClass === "Debt") {
        return `${fund.name} aims to generate regular income and capital preservation by investing in fixed income securities.`;
      } else if (fund.assetClass === "Hybrid") {
        return `${fund.name} seeks to provide both growth and income by investing in a mix of equity and debt instruments.`;
      }
      
      return `The investment objective details for ${fund.name} are not available.`;
    }
  },
  
  // Minimum investment questions
  {
    patterns: [
      /minimum investment/i,
      /least amount/i,
      /minimum amount/i,
      /what is the minimum investment/i,
      /fund size/i,
      /aum/i,
      /what'?s the aum/i
    ],
    handler: (query, fund) => {
      if (query.includes("aum") || query.includes("fund size")) {
        if (fund.aum) {
          return `The Assets Under Management (AUM) for ${fund.name} is ₹${fund.aum.toLocaleString()} crore.`;
        } else {
          return `AUM details for ${fund.name} are not available.`;
        }
      }
      
      if (fund.minInvestment) {
        return `The minimum investment required for ${fund.name} is ₹${fund.minInvestment}.`;
      }
      
      return `The standard minimum investment for ${fund.name} is typically ₹5,000 for lump sum and ₹500 for SIP.`;
    }
  },
  
  // Fund classification questions
  {
    patterns: [
      /open-ended or closed-ended/i,
      /sebi classification/i,
      /is .* open-ended/i,
      /is .* actively managed/i
    ],
    handler: (query, fund) => {
      if (query.includes("actively managed")) {
        if (fund.category && (fund.category.includes("Index") || fund.category.includes("ETF"))) {
          return `No, ${fund.name} is a passively managed fund that tracks an index.`;
        } else {
          return `Yes, ${fund.name} is an actively managed fund with professional fund managers making investment decisions.`;
        }
      }
      
      if (fund.category && (fund.category.includes("FMP") || fund.category.includes("Fixed Maturity"))) {
        return `${fund.name} is a closed-ended fund with a fixed maturity period.`;
      } else if (fund.category && fund.category.includes("Open")) {
        return `${fund.name} is an open-ended fund allowing investments and redemptions on an ongoing basis.`;
      } else if (fund.category && fund.category.includes("Close")) {
        return `${fund.name} is a closed-ended fund.`;
      } else if (fund.category) {
        if (["Liquid", "Ultra Short", "Money Market", "Overnight"].some(type => fund.category.includes(type))) {
          return `${fund.name} is an open-ended fund.`;
        } else if (["FMP", "Fixed Maturity"].some(type => fund.category.includes(type))) {
          return `${fund.name} is a closed-ended fund.`;
        }
      }
      
      return `Fund classification details for ${fund.name} are not available.`;
    }
  },
  
  // Fund manager questions
  {
    patterns: [
      /who is managing/i,
      /fund manager/i,
      /manager of the fund/i
    ],
    handler: (query, fund) => {
      if (fund.fundManager) {
        return `${fund.name} is currently managed by ${fund.fundManager}.`;
      }
      return `Fund manager information for ${fund.name} is not available.`;
    }
  },
  
  // Expert opinion questions
  {
    patterns: [
      /expert opinions/i,
      /what are expert opinions/i,
      /what'?s the latest fund review/i,
      /review of/i
    ],
    handler: (query, fund) => {
      if (fund.analystRating) {
        return `Expert analysts rate ${fund.name} as "${fund.analystRating}".`;
      }
      
      // Generate generic response based on performance
      if (fund.oneYearReturn) {
        if (fund.oneYearReturn > 15) {
          return `${fund.name} has been performing well with returns of ${fund.oneYearReturn.toFixed(2)}% over the past year, which analysts view positively.`;
        } else if (fund.oneYearReturn > 8) {
          return `${fund.name} has shown stable performance with returns of ${fund.oneYearReturn.toFixed(2)}% over the past year.`;
        } else {
          return `${fund.name} has shown modest returns of ${fund.oneYearReturn.toFixed(2)}% over the past year.`;
        }
      }
      
      return `Expert opinions and reviews for ${fund.name} are not available.`;
    }
  },
  
  // Investment decision questions
  {
    patterns: [
      /should i hold or redeem/i,
      /suitable for a conservative investor/i
    ],
    handler: (query, fund) => {
      if (query.includes("conservative investor")) {
        if (fund.risk === "Low") {
          return `Yes, ${fund.name} may be suitable for conservative investors due to its lower risk profile.`;
        } else if (fund.risk === "High") {
          return `No, ${fund.name} may not be suitable for conservative investors due to its higher risk profile.`;
        } else {
          return `${fund.name} has a moderate risk profile; conservative investors should evaluate if it matches their risk tolerance.`;
        }
      }
      
      if (query.includes("hold or redeem")) {
        return `Investment decisions should be based on your financial goals and risk tolerance. Consider consulting a financial advisor about your ${fund.name} investment.`;
      }
      
      return null;
    }
  }
];

// Enhanced fund name mapping for better accuracy based on the training data
// Maps common aliases and abbreviations to their full fund names
export const fundNameMapping: { [key: string]: string } = {
  // SBI funds
  "sbi auto": "SBI Automotive Opportunities Fund",
  "sbi automotive": "SBI Automotive Opportunities Fund",
  "sbi auto fund": "SBI Automotive Opportunities Fund",
  "sbi auto opportunities": "SBI Automotive Opportunities Fund",
  
  // HDFC funds
  "hdfc g-sec": "HDFC Nifty G-Sec Sep 2032 Index Fund",
  "hdfc g-sec 2032": "HDFC Nifty G-Sec Sep 2032 Index Fund",
  "hdfc nifty gilt": "HDFC Nifty G-Sec Sep 2032 Index Fund",
  "hdfc nifty gilt 2032": "HDFC Nifty G-Sec Sep 2032 Index Fund",
  "hdfc fmp": "HDFC FMP 2638D February 2023",
  "hdfc fmp 2638d": "HDFC FMP 2638D February 2023",
  "hdfc fmp feb 2023": "HDFC FMP 2638D February 2023",
  "hdfc fixed maturity plan feb 2023": "HDFC FMP 2638D February 2023",
  
  // Bandhan funds
  "bandhan bond income": "Bandhan Bond Fund - Income Plan",
  "bandhan income plan": "Bandhan Bond Fund - Income Plan",
  "bandhan bond": "Bandhan Bond Fund - Income Plan",
  "bandhan ust": "Bandhan Ultra Short Term Fund",
  "bandhan ust fund": "Bandhan Ultra Short Term Fund", 
  "bandhan ultra short": "Bandhan Ultra Short Term Fund",
  "bandhan ultra short term": "Bandhan Ultra Short Term Fund",
  "bandhan short term": "Bandhan Ultra Short Term Fund",
  "bandhan long term debt": "Bandhan Bond Fund - Income Plan",
  
  // DSP funds
  "dsp fmp 270": "DSP FMP Series 270 - 1144 Days",
  "dsp fmp 1144 days": "DSP FMP Series 270 - 1144 Days",
  "dsp fixed maturity 270": "DSP FMP Series 270 - 1144 Days",
  
  // Axis funds
  "axis floater": "Axis Floating Rate Fund",
  "axis floating rate": "Axis Floating Rate Fund",
  "axis frf": "Axis Floating Rate Fund",
  
  // ICICI funds
  "icici 1199 days fmp": "ICICI Prudential Fixed Maturity Plan - Series 88 - 1199 days Plan Q",
  "icici pru fmp 1199q": "ICICI Prudential Fixed Maturity Plan - Series 88 - 1199 days Plan Q",
  "icici fmp series 88": "ICICI Prudential Fixed Maturity Plan - Series 88 - 1199 days Plan Q",
  
  // Motilal Oswal funds
  "mo business cycle": "Motilal Oswal Business Cycle Fund",
  "motilal cycle fund": "Motilal Oswal Business Cycle Fund",
  "motilal business cycle": "Motilal Oswal Business Cycle Fund",
  
  // Franklin funds
  "franklin liquid": "Franklin India Liquid Fund",
  "franklin india liquid": "Franklin India Liquid Fund",
  "franklin short term": "Franklin India Liquid Fund"
};

// Enhanced function to identify if a query is a financial question
export function isFinancialQuestion(query: string): boolean {
  // Lowercase the query for case-insensitive matching
  const lowerQuery = query.toLowerCase();
  
  // Common financial question indicators
  const financialKeywords = [
    'nav', 'return', 'dividend', 'sip', 'investment', 'fund', 'lock-in',
    'switch', 'long-term', 'expense ratio', 'risk', 'benchmark', 'sharpe',
    'amfi', 'asset', 'portfolio', 'redemption', 'objective', 'minimum',
    'performance', 'volatility', 'better than', 'outperforming', 'aum',
    'manager', 'horizon', 'review', 'idcw', 'growth option', 'swp',
    'conservative', 'suitable', 'lock-in', 'opinion', 'actively managed',
    'open-ended', 'closed-ended', 'cagr', 'surplus', 'retirement'
  ];
  
  // Check if the query contains any of the financial keywords
  return financialKeywords.some(keyword => lowerQuery.includes(keyword));
}

// Function to match a question to the most appropriate fund
export function matchQuestionToFund(query: string): Fund | null {
  const lowerQuery = query.toLowerCase();
  
  // First, check if the query contains any known fund alias
  for (const [alias, fundName] of Object.entries(fundNameMapping)) {
    if (lowerQuery.includes(alias.toLowerCase())) {
      // Look for a fund with this name
      const matchedFund = [...databaseStructure.mutualFundsData].find(
        fund => fund.name === fundName || fund.shortName === fundName
      );
      
      if (matchedFund) {
        return matchedFund;
      }
    }
  }
  
  // If no alias match, look for individual fund names in the query
  const allFunds = [...databaseStructure.mutualFundsData];
  
  // First try exact name matches
  for (const fund of allFunds) {
    if (fund.name && lowerQuery.includes(fund.name.toLowerCase())) {
      return fund;
    }
    
    if (fund.shortName && lowerQuery.includes(fund.shortName.toLowerCase())) {
      return fund;
    }
  }
  
  // Then try partial name matches with fund houses and categories
  for (const fund of allFunds) {
    // Check fund house match
    if (fund.fundHouse && lowerQuery.includes(fund.fundHouse.toLowerCase())) {
      // Further check for matching category or sector
      if ((fund.category && lowerQuery.includes(fund.category.toLowerCase())) ||
          (fund.sector && lowerQuery.includes(fund.sector.toLowerCase()))) {
        return fund;
      }
    }
  }
  
  // If no match found, return null
  return null;
}
