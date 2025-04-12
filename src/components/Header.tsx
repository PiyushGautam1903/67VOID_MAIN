
import { SearchIcon, GraduationCap } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  return (
    <div className="w-full py-4 border-b border-gray-800 bg-black sticky top-0 z-10 px-4">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center space-x-2">
            <SearchIcon className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-white">FunStocks AI</h1>
          </div>
          
          <Tabs value={activeTab} onValueChange={onTabChange} className="w-full md:w-auto">
            <TabsList className="grid w-full md:w-auto grid-cols-2 bg-gray-900">
              <TabsTrigger value="search" className="flex items-center gap-1 data-[state=active]:bg-primary">
                <SearchIcon className="h-4 w-4" />
                <span>Search</span>
              </TabsTrigger>
              <TabsTrigger value="about" className="flex items-center gap-1 data-[state=active]:bg-primary">
                <GraduationCap className="h-4 w-4" />
                <span>About</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Header;
