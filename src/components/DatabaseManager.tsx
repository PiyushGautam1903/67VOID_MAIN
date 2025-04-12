
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from '@/components/ui/use-toast';
import { DatabaseStructure } from '@/types/fund';
import { databaseStructure } from '@/data/databaseStructure';

const DatabaseManager = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mutualFundsJson, setMutualFundsJson] = useState('');
  const [stocksJson, setStocksJson] = useState('');
  const [holdingsJson, setHoldingsJson] = useState('');
  
  const handleImportMutualFunds = () => {
    try {
      const data = JSON.parse(mutualFundsJson);
      if (Array.isArray(data)) {
        // Update the database structure
        databaseStructure.mutualFundsData = data;
        
        toast({
          title: "Mutual Funds Data Imported",
          description: `Successfully imported ${data.length} mutual fund records.`,
          duration: 3000,
        });
        
        setIsOpen(false);
      } else {
        throw new Error("Data must be an array");
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid JSON format. Please check your data.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleImportStocks = () => {
    try {
      const data = JSON.parse(stocksJson);
      if (Array.isArray(data)) {
        // Update the database structure
        databaseStructure.stocksData = data;
        
        toast({
          title: "Stocks Data Imported",
          description: `Successfully imported ${data.length} stock records.`,
          duration: 3000,
        });
        
        setIsOpen(false);
      } else {
        throw new Error("Data must be an array");
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid JSON format. Please check your data.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  const handleImportHoldings = () => {
    try {
      const data = JSON.parse(holdingsJson);
      if (Array.isArray(data)) {
        // Update the database structure
        databaseStructure.mutualFundHoldingsData = data;
        
        toast({
          title: "Holdings Data Imported",
          description: `Successfully imported ${data.length} holding records.`,
          duration: 3000,
        });
        
        setIsOpen(false);
      } else {
        throw new Error("Data must be an array");
      }
    } catch (error) {
      toast({
        title: "Import Error",
        description: "Invalid JSON format. Please check your data.",
        variant: "destructive",
        duration: 5000,
      });
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="mt-4 mb-6">Import Database</Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Database Manager</DialogTitle>
          <DialogDescription>
            Import JSON data for mutual funds, stocks, and mutual fund holdings
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="mutual-funds" className="w-full">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="mutual-funds">Mutual Funds</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="holdings">Holdings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="mutual-funds" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Paste Mutual Funds JSON</h3>
              <Textarea 
                value={mutualFundsJson} 
                onChange={(e) => setMutualFundsJson(e.target.value)}
                placeholder="Paste mutual funds JSON array here..."
                className="h-72 font-mono text-sm"
              />
              <Button onClick={handleImportMutualFunds}>Import Mutual Funds</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="stocks" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Paste Stocks JSON</h3>
              <Textarea 
                value={stocksJson} 
                onChange={(e) => setStocksJson(e.target.value)}
                placeholder="Paste stocks JSON array here..."
                className="h-72 font-mono text-sm"
              />
              <Button onClick={handleImportStocks}>Import Stocks</Button>
            </div>
          </TabsContent>
          
          <TabsContent value="holdings" className="space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Paste Fund Holdings JSON</h3>
              <Textarea 
                value={holdingsJson} 
                onChange={(e) => setHoldingsJson(e.target.value)}
                placeholder="Paste mutual fund holdings JSON array here..."
                className="h-72 font-mono text-sm"
              />
              <Button onClick={handleImportHoldings}>Import Holdings</Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default DatabaseManager;
