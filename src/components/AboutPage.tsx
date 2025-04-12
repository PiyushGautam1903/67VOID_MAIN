
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Database, Brain, Zap, BarChart2, Code, Server } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold mb-4 text-white">FunStocks AI</h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Smart stock search that understands what you're looking for
          </p>
        </div>

        <Card className="bg-gray-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <BarChart2 className="h-5 w-5 text-primary" />
              The Problem
            </CardTitle>
          </CardHeader>
          <CardContent className="text-gray-300">
            <p>
              Traditional fund search systems often struggle with incomplete or ambiguous searches. Our solution uses 
              a compact AI model to understand what you're looking for, even when your search terms are partial or contain typos.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Brain className="h-5 w-5 text-primary" />
                How It Works
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-gray-300">
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Database className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Clean Data</p>
                    <p className="text-sm">Organized fund information</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Smart Search</p>
                    <p className="text-sm">AI understands your search intent</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Server className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Fast Results</p>
                    <p className="text-sm">Quickly find matching funds</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="flex-shrink-0 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">Explained Matches</p>
                    <p className="text-sm">See why each fund matched your search</p>
                  </div>
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Code className="h-5 w-5 text-primary" />
                Tech Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-4 text-gray-300">
                <li>
                  <p className="font-medium text-white">Compact AI</p>
                  <p className="text-sm">Small language model focused on financial terms</p>
                </li>
                <li>
                  <p className="font-medium text-white">Smart Templates</p>
                  <p className="text-sm">
                    Enhanced search with fund details
                  </p>
                </li>
                <li>
                  <p className="font-medium text-white">Text Processing</p>
                  <p className="text-sm">
                    Handles abbreviations and typos
                  </p>
                </li>
                <li>
                  <p className="font-medium text-white">Lightweight Design</p>
                  <p className="text-sm">
                    Fast performance on standard hardware
                  </p>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8 bg-gray-700" />

        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4 text-white">Demo Team</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {["Data Engineer", "ML Engineer", "Backend Dev", "Frontend Dev"].map((role) => (
              <Card key={role} className="bg-gray-800">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/20 flex items-center justify-center mb-3">
                    <Brain className="h-6 w-6 text-primary" />
                  </div>
                  <p className="font-medium text-white">{role}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutPage;
