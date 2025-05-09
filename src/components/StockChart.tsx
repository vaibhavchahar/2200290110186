
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockPrice, calculateAveragePrice } from "@/services/stockService";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface StockChartProps {
  symbol: string;
  prices: StockPrice[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    const price = payload[0].value;
    const timestamp = new Date(label);

    return (
      <div className="rounded-lg border bg-card p-3 shadow-lg">
        <p className="text-sm font-semibold">{format(timestamp, "MMM d, yyyy HH:mm:ss")}</p>
        <p className="text-xl font-bold">
          ${price.toFixed(2)}
          <span className="text-xs font-normal ml-1">USD</span>
        </p>
      </div>
    );
  }

  return null;
};

const StockChart: React.FC<StockChartProps> = ({ symbol, prices }) => {
  const [activePoint, setActivePoint] = useState<number | null>(null);

  if (!prices.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{symbol || "Stock"} Price History</CardTitle>
        </CardHeader>
        <CardContent className="h-80 flex items-center justify-center">
          <p className="text-muted-foreground">No price data available</p>
        </CardContent>
      </Card>
    );
  }

  // Prepare data for chart
  const chartData = prices.map((item) => ({
    timestamp: item.timestamp,
    price: item.price
  }));

  const averagePrice = calculateAveragePrice(prices);

  // Find min and max for chart range
  const minPrice = Math.min(...prices.map(p => p.price));
  const maxPrice = Math.max(...prices.map(p => p.price));
  const buffer = (maxPrice - minPrice) * 0.1; // 10% buffer
  
  // Get latest price and price change
  const latestPrice = prices[prices.length - 1]?.price || 0;
  const firstPrice = prices[0]?.price || 0;
  const priceChange = latestPrice - firstPrice;
  const priceChangePercent = (priceChange / firstPrice) * 100;
  const isPositive = priceChange >= 0;
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>{symbol} Price</span>
          <div className="flex items-center gap-2">
            <span className="text-lg">${latestPrice.toFixed(2)}</span>
            <span className={`text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {isPositive ? '+' : ''}{priceChange.toFixed(2)} ({priceChangePercent.toFixed(2)}%)
            </span>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 5, right: 20, left: 20, bottom: 25 }}
            onMouseMove={(e) => {
              if (e.activeTooltipIndex !== undefined) {
                setActivePoint(e.activeTooltipIndex);
              }
            }}
            onMouseLeave={() => setActivePoint(null)}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
            <XAxis 
              dataKey="timestamp" 
              tickFormatter={(timestamp) => format(new Date(timestamp), "HH:mm")}
              angle={-45}
              textAnchor="end"
              height={50}
            />
            <YAxis 
              domain={[Math.max(0, minPrice - buffer), maxPrice + buffer]} 
              tickFormatter={(value) => `$${value.toFixed(0)}`} 
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine 
              y={averagePrice} 
              stroke="#f59e0b" 
              strokeDasharray="3 3" 
              label={{ 
                value: `Avg: $${averagePrice.toFixed(2)}`, 
                position: 'right', 
                fill: '#f59e0b',
                fontSize: 12
              }} 
            />
            <Area 
              type="monotone" 
              dataKey="price" 
              stroke={isPositive ? "#22c55e" : "#ef4444"} 
              fill={isPositive ? "#22c55e" : "#ef4444"} 
              fillOpacity={0.1}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export default StockChart;
