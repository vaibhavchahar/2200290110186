
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stock, StockPriceData, calculateCorrelation } from "@/services/stockService";
import { Tooltip } from "@/components/ui/tooltip";
import { TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface CorrelationHeatmapProps {
  stocks: Stock[];
  stockPrices: { [key: string]: StockPriceData };
  onSelectStock: (stockSymbol: string) => void;
}

const getCorrelationColorClass = (correlation: number): string => {
  if (correlation >= 0.75) return "bg-correlation-high-positive";
  if (correlation >= 0.5) return "bg-correlation-medium-positive";
  if (correlation >= 0.25) return "bg-correlation-low-positive";
  if (correlation >= -0.25) return "bg-correlation-neutral";
  if (correlation >= -0.5) return "bg-correlation-low-negative";
  if (correlation >= -0.75) return "bg-correlation-medium-negative";
  return "bg-correlation-high-negative";
};

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ stocks, stockPrices, onSelectStock }) => {
  const [hoveredStock, setHoveredStock] = useState<string | null>(null);

  // Create correlation matrix
  const correlationMatrix: { [key: string]: { [key: string]: number } } = {};

  // Calculate correlations between all stock pairs
  stocks.forEach((stock1) => {
    correlationMatrix[stock1.symbol] = {};
    
    stocks.forEach((stock2) => {
      if (stockPrices[stock1.symbol] && stockPrices[stock2.symbol]) {
        const prices1 = stockPrices[stock1.symbol].prices;
        const prices2 = stockPrices[stock2.symbol].prices;
        
        // If it's the same stock, correlation is 1
        if (stock1.symbol === stock2.symbol) {
          correlationMatrix[stock1.symbol][stock2.symbol] = 1;
        } else {
          const correlation = calculateCorrelation(prices1, prices2);
          correlationMatrix[stock1.symbol][stock2.symbol] = correlation;
        }
      } else {
        correlationMatrix[stock1.symbol][stock2.symbol] = 0;
      }
    });
  });

  if (Object.keys(correlationMatrix).length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Stock Correlation Heatmap</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p>No correlation data available. Please wait for price data to load.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full overflow-auto">
      <CardHeader>
        <CardTitle>Stock Correlation Heatmap</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative overflow-x-auto">
          <table className="w-full text-sm text-center">
            <thead>
              <tr>
                <th className="p-2 border bg-muted font-semibold sticky left-0 z-10">Stock</th>
                {stocks.map((stock) => (
                  <th key={stock.symbol} className="p-2 border bg-muted font-medium min-w-[60px]">
                    {stock.symbol}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {stocks.map((rowStock) => (
                <tr 
                  key={rowStock.symbol}
                  className={hoveredStock === rowStock.symbol ? "bg-muted/50" : ""}
                >
                  <td 
                    className="p-2 border font-semibold text-left sticky left-0 bg-muted z-10 cursor-pointer"
                    onClick={() => onSelectStock(rowStock.symbol)}
                    onMouseEnter={() => setHoveredStock(rowStock.symbol)}
                    onMouseLeave={() => setHoveredStock(null)}
                  >
                    {rowStock.symbol}
                  </td>
                  {stocks.map((colStock) => {
                    const correlation = correlationMatrix[rowStock.symbol][colStock.symbol];
                    const colorClass = getCorrelationColorClass(correlation);
                    
                    return (
                      <TooltipProvider key={colStock.symbol}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <td 
                              className={`p-2 border ${colorClass} cursor-pointer ${
                                hoveredStock === colStock.symbol ? "ring-2 ring-primary" : ""
                              }`}
                              onClick={() => onSelectStock(colStock.symbol)}
                              onMouseEnter={() => setHoveredStock(colStock.symbol)}
                              onMouseLeave={() => setHoveredStock(null)}
                            >
                              {correlation.toFixed(2)}
                            </td>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Correlation between {rowStock.symbol} and {colStock.symbol}: {correlation.toFixed(2)}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-6 flex flex-col space-y-2">
          <h4 className="text-sm font-semibold">Correlation Legend</h4>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-high-positive mr-2"></div>
              <span className="text-xs">Strong Positive (0.75-1.0)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-medium-positive mr-2"></div>
              <span className="text-xs">Medium Positive (0.5-0.75)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-low-positive mr-2"></div>
              <span className="text-xs">Weak Positive (0.25-0.5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-neutral mr-2"></div>
              <span className="text-xs">No Correlation (-0.25-0.25)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-low-negative mr-2"></div>
              <span className="text-xs">Weak Negative (-0.5--0.25)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-medium-negative mr-2"></div>
              <span className="text-xs">Medium Negative (-0.75--0.5)</span>
            </div>
            <div className="flex items-center">
              <div className="w-4 h-4 bg-correlation-high-negative mr-2"></div>
              <span className="text-xs">Strong Negative (-1.0--0.75)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CorrelationHeatmap;
