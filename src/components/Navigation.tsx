
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { ChartLine, BarChart2 } from "lucide-react";

const Navigation: React.FC = () => {
  const location = useLocation();
  
  const navItems = [
    {
      path: "/",
      name: "Stock Chart",
      icon: <ChartLine className="w-5 h-5" />
    },
    {
      path: "/correlation",
      name: "Correlation",
      icon: <BarChart2 className="w-5 h-5" />
    }
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background border-b border-border shadow-sm">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center space-x-2">
          <ChartLine className="h-6 w-6 text-blue-500" />
          <span className="hidden md:inline-block font-bold text-lg">
            StockMarket App
          </span>
        </div>
        <nav className="flex flex-1 items-center space-x-4 justify-end md:justify-start md:ml-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location.pathname === item.path
                  ? "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                  : "text-muted-foreground hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/50 dark:hover:text-blue-300"
              )}
            >
              <span className="mr-2">{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default Navigation;
