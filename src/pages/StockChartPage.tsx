
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { fetchStockList, fetchStockPriceHistory, Stock, StockPrice } from "@/services/stockService";
import StockSelector from "@/components/StockSelector";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import StockChart from "@/components/StockChart";
import StockDetails from "@/components/StockDetails";
import LoadingSpinner from "@/components/LoadingSpinner";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

const StockChartPage: React.FC = () => {
  const { toast } = useToast();
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedStock, setSelectedStock] = useState<string>("");
  const [timeRange, setTimeRange] = useState<number>(15);
  const [prices, setPrices] = useState<StockPrice[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLoadingPrices, setIsLoadingPrices] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch list of stocks on component mount
  useEffect(() => {
    loadStockData();
  }, []);

  const loadStockData = async () => {
    setIsLoading(true);
    try {
      const stockList = await fetchStockList();
      setStocks(stockList);
      if (stockList.length > 0) {
        setSelectedStock(stockList[0].symbol);
      }
    } catch (error) {
      console.error("Failed to load stocks:", error);
      toast({
        title: "Error",
        description: "Sorry, couldn't load stocks. Maybe try refreshing?",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch price data when selected stock or time range changes
  useEffect(() => {
    if (!selectedStock) return;

    const loadPriceData = async () => {
      setIsLoadingPrices(true);
      try {
        const priceData = await fetchStockPriceHistory(selectedStock, timeRange);
        if (priceData && priceData.prices) {
          setPrices(priceData.prices);
          setLastUpdated(new Date());
        } else {
          setPrices([]);
          toast({
            title: "No data",
            description: `Couldn't find any price data for ${selectedStock}. Maybe try another stock?`,
          });
        }
      } catch (error) {
        console.error("Failed to load price data:", error);
        toast({
          title: "Error",
          description: `Something went wrong getting prices for ${selectedStock}.`,
          variant: "destructive",
        });
        setPrices([]);
      } finally {
        setIsLoadingPrices(false);
      }
    };

    loadPriceData();
  }, [selectedStock, timeRange, toast]);

  const handleStockChange = (stock: string) => {
    setSelectedStock(stock);
  };

  const handleTimeRangeChange = (minutes: number) => {
    setTimeRange(minutes);
  };

  const handleRefresh = () => {
    if (selectedStock) {
      const loadPriceData = async () => {
        setIsLoadingPrices(true);
        try {
          const priceData = await fetchStockPriceHistory(selectedStock, timeRange);
          if (priceData && priceData.prices) {
            setPrices(priceData.prices);
            setLastUpdated(new Date());
            toast({
              title: "Updated",
              description: "Stock data refreshed!",
            });
          }
        } catch (error) {
          console.error("Failed to refresh price data:", error);
          toast({
            title: "Error",
            description: "Couldn't refresh the data. Try again?",
            variant: "destructive",
          });
        } finally {
          setIsLoadingPrices(false);
        }
      };
      loadPriceData();
    }
  };

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="container py-4 mx-auto">
      <div className="flex flex-col space-y-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <StockSelector
            stocks={stocks}
            selectedStock={selectedStock}
            onSelectStock={handleStockChange}
            isLoading={isLoading}
          />
          <TimeRangeSelector
            selectedMinutes={timeRange}
            onSelectMinutes={handleTimeRangeChange}
            isLoading={isLoadingPrices}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh} 
            disabled={isLoadingPrices}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {stocks.length === 0 && !isLoading && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              No stocks available. Check your internet connection and try refreshing the page.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {isLoadingPrices ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 gap-6">
          <StockChart symbol={selectedStock} prices={prices} />
          <StockDetails symbol={selectedStock} prices={prices} />
          
          {prices.length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <p>No price data available right now.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try selecting a different stock or time range.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default StockChartPage;
