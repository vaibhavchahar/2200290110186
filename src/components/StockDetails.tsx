
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockPrice, calculateAveragePrice, calculateStandardDeviation } from "@/services/stockService";
import { ArrowUp, ArrowDown } from "lucide-react";

interface StockDetailsProps {
  symbol: string;
  prices: StockPrice[];
}

const StockDetails: React.FC<StockDetailsProps> = ({ symbol, prices }) => {
  if (!prices.length) return null;

  const averagePrice = calculateAveragePrice(prices);
  const stdDeviation = calculateStandardDeviation(prices);
  
  // Calculate price change
  const firstPrice = prices[0]?.price || 0;
  const lastPrice = prices[prices.length - 1]?.price || 0;
  const priceChange = lastPrice - firstPrice;
  const priceChangePercent = firstPrice > 0 ? (priceChange / firstPrice) * 100 : 0;
  const isPositive = priceChange >= 0;
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>{symbol} Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Current Price</h3>
            <p className="text-2xl font-bold">${lastPrice.toFixed(2)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Price Change</h3>
            <div className={`text-2xl font-bold flex items-center ${isPositive ? 'text-financial-positive' : 'text-financial-negative'}`}>
              {isPositive ? (
                <ArrowUp className="h-5 w-5 mr-1" />
              ) : (
                <ArrowDown className="h-5 w-5 mr-1" />
              )}
              ${Math.abs(priceChange).toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Average Price</h3>
            <p className="text-2xl font-bold">${averagePrice.toFixed(2)}</p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground">Standard Deviation</h3>
            <p className="text-2xl font-bold">${stdDeviation.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground mt-1">Price volatility measure</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StockDetails;
