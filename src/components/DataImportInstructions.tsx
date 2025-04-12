
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useNavigate } from 'react-router-dom';

const DataImportInstructions = () => {
  const navigate = useNavigate();

  const handleShowDatabaseManager = () => {
    // Navigate to home and then the DatabaseManager will be available
    navigate('/');
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-4 text-center">Data Import Instructions</h1>
      <p className="text-center mb-8 text-gray-500">
        Follow these steps to import your datasets into the application
      </p>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Step 1: Locate Your Data Files</CardTitle>
            <CardDescription>
              Prepare your three datasets in the formats specified below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium text-sm mb-2">Option 1: Edit Source Files (Recommended for Developers)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Edit these files directly in your code editor:
                </p>
                <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
                  <li><code className="bg-gray-100 px-1 rounded">src/data/userMutualFundsData.ts</code> - For mutual funds data</li>
                  <li><code className="bg-gray-100 px-1 rounded">src/data/userStocksData.ts</code> - For stocks data</li>
                  <li><code className="bg-gray-100 px-1 rounded">src/data/userMutualFundHoldingsData.ts</code> - For holdings data</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-medium text-sm mb-2">Option 2: Use Database Manager (For Non-developers)</h3>
                <p className="text-sm text-gray-600 mb-2">
                  Use the Database Manager UI to paste your JSON data:
                </p>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleShowDatabaseManager}
                >
                  <FileText className="h-4 w-4" />
                  Open Database Manager
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Step 2: Data Format Requirements</CardTitle>
            <CardDescription>
              Make sure your data follows these formats exactly
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-medium text-sm mb-2">Mutual Funds Data Format</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`[
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
]`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2">Stocks Data Format</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`[
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
]`}
              </pre>
            </div>
            
            <div>
              <h3 className="font-medium text-sm mb-2">Mutual Fund Holdings Data Format</h3>
              <pre className="bg-gray-900 text-gray-100 p-3 rounded text-xs overflow-x-auto">
{`[
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
]`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataImportInstructions;
