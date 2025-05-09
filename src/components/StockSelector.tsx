
import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Stock } from "@/services/stockService";

interface StockSelectorProps {
  stocks: Stock[];
  selectedStock: string;
  onSelectStock: (stock: string) => void;
  isLoading: boolean;
}

const StockSelector: React.FC<StockSelectorProps> = ({
  stocks,
  selectedStock,
  onSelectStock,
  isLoading
}) => {
  return (
    <div className="w-full md:w-64">
      <Select
        value={selectedStock}
        onValueChange={onSelectStock}
        disabled={isLoading || stocks.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select a stock" />
        </SelectTrigger>
        <SelectContent>
          {stocks.map((stock) => (
            <SelectItem key={stock.symbol} value={stock.symbol}>
              {stock.symbol} - {stock.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StockSelector;
