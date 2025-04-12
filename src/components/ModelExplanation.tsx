
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Brain, Database, Search, Zap } from "lucide-react";

const ModelExplanation = () => {
  return (
    <Card className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-white">
          <Brain className="h-5 w-5 text-primary" />
          How Our Stock Search Works
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Database className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Smart Database</h3>
                <p className="text-sm text-gray-400">
                  Fund details converted to a format our AI can understand
                </p>
              </div>
            </div>
            <div className="flex">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Search className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Meaning Matcher</h3>
                <p className="text-sm text-gray-400">
                  Understands what you mean, not just what you type
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex">
              <div className="mr-4 flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
                <Zap className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Smart Sorting</h3>
                <p className="text-sm text-gray-400">
                  Our AI ranks results by relevance and explains why they matched
                </p>
              </div>
            </div>
            <div>
              <Separator className="my-2 bg-gray-800" />
              <p className="text-xs text-gray-400 mt-2">
                Try searching with partial names like "icici infra", "sbi tech", or even with typos like "kotak gld"
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ModelExplanation;
