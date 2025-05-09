import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchStockList, fetchStockPriceHistory, Stock, StockPriceData } from "@/services/stockService";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import CorrelationHeatmap from "@/components/CorrelationHeatmap";
import StockDetails from "@/components/StockDetails";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const CorrelationHeatmapPage: React.FC = () => {
  const { toast } = useToast();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [stockPrices, setStockPrices] = useState<{ [key: string]: StockPriceData }>({});
  const [timeRange, setTimeRange] = useState<number>(15);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch list of stocks on component mount
  useEffect(() => {
    loadStocks();
  }, []);

  const loadStocks = async () => {
    try {
      setIsLoading(true);
      const stockList = await fetchStockList();
      // To keep it fast, just use 8 stocks
      const limitedStockList = stockList.slice(0, 8);
      setStocks(limitedStockList);
    } catch (error) {
      console.error("Failed to load stocks:", error);
      toast({
        title: "Error",
        description: "Had trouble getting the stock list. Maybe try again?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch price data for all stocks when time range changes
  useEffect(() => {
    if (stocks.length === 0) return;
    loadAllPrices();
  }, [stocks, timeRange]);

  const loadAllPrices = async () => {
    if (stocks.length === 0) return;
    
    setIsLoading(true);
    const priceDataMap: { [key: string]: StockPriceData } = {};

    try {
      // Fetch prices for stocks one at a time to avoid overwhelming the API
      for (const stock of stocks) {
        try {
          const priceData = await fetchStockPriceHistory(stock.symbol, timeRange);
          if (priceData && priceData.prices) {
            priceDataMap[stock.symbol] = priceData;
          }
        } catch (error) {
          console.error(`Error fetching price data for ${stock.symbol}:`, error);
        }
      }

      setStockPrices(priceDataMap);
      setLastUpdated(new Date());
      
      // Set first stock as selected if none selected
      if (!selectedStock && stocks.length > 0) {
        setSelectedStock(stocks[0].symbol);
      }
    } catch (error) {
      console.error("Failed to load price data:", error);
      toast({
        title: "Error",
        description: "Some stock price data couldn't be loaded.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeRangeChange = (minutes: number) => {
    setTimeRange(minutes);
  };

  const handleSelectStock = (stockSymbol: string) => {
    setSelectedStock(stockSymbol);
  };

  const handleRefresh = () => {
    loadAllPrices();
    toast({
      title: "Refreshing",
      description: "Getting fresh correlation data...",
    });
  };

  return (
    <div className="container py-4 mx-auto">
      <div className="mb-6 flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <TimeRangeSelector
            selectedMinutes={timeRange}
            onSelectMinutes={handleTimeRangeChange}
            isLoading={isLoading}
          />
          
          <Button 
            variant="outline"
            onClick={handleRefresh} 
            disabled={isLoading || stocks.length === 0}
            size="sm"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh Data
          </Button>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Last updated: {lastUpdated.toLocaleTimeString()} 
          {isLoading && " (Refreshing...)"}
        </div>
        
        {stocks.length === 0 && !isLoading && (
          <Alert variant="destructive">
            <AlertDescription>
              Couldn't get stock data. Try refreshing the page.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <CorrelationHeatmap 
            stocks={stocks} 
            stockPrices={stockPrices} 
            onSelectStock={handleSelectStock} 
          />
          
          {selectedStock && stockPrices[selectedStock] ? (
            <StockDetails 
              symbol={selectedStock} 
              prices={stockPrices[selectedStock].prices} 
            />
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">
                  Select a stock from the heatmap to see its details
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrelationHeatmapPage;
