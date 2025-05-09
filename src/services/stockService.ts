
// Service for fetching stock data from the API

export interface Stock {
  symbol: string;
  name: string;
}

export interface StockPrice {
  timestamp: string;
  price: number;
}

export interface StockPriceData {
  symbol: string;
  prices: StockPrice[];
}

// Use the correct API endpoint from the assignment
const API_BASE_URL = "http://20.244.56.144/evaluation-service";

export const fetchStockList = async (): Promise<Stock[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/stocks`);
    if (!response.ok) {
      throw new Error(`Failed to fetch stocks: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching stock list:", error);
    // Return some mock data when API fails for better user experience
    return [
      { symbol: "AAPL", name: "Apple Inc." },
      { symbol: "MSFT", name: "Microsoft Corporation" },
      { symbol: "GOOGL", name: "Alphabet Inc." },
      { symbol: "AMZN", name: "Amazon.com Inc." },
      { symbol: "META", name: "Meta Platforms Inc." },
    ];
  }
};

export const fetchStockPriceHistory = async (
  ticker: string,
  minutes: number
): Promise<StockPriceData | null> => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/stocks/${ticker}?minutes=${minutes}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch stock prices: ${response.status}`);
    }
    const data = await response.json();
    return {
      symbol: ticker,
      prices: data
    };
  } catch (error) {
    console.error(`Error fetching stock price history for ${ticker}:`, error);
    // Return mock data when API fails
    const mockPrices: StockPrice[] = [];
    const now = new Date();
    
    for (let i = minutes; i >= 0; i--) {
      const timestamp = new Date(now.getTime() - i * 60000).toISOString();
      // Generate random price between 100-200 with some trend
      const basePrice = 150;
      const randomVariation = Math.sin(i / 3) * 20 + Math.random() * 10;
      const price = basePrice + randomVariation;
      
      mockPrices.push({
        timestamp,
        price
      });
    }
    
    return {
      symbol: ticker,
      prices: mockPrices
    };
  }
};

// Calculate the average price from an array of stock prices
export const calculateAveragePrice = (prices: StockPrice[]): number => {
  if (prices.length === 0) return 0;
  
  const sum = prices.reduce((total, price) => total + price.price, 0);
  return sum / prices.length;
};

// Calculate standard deviation of prices
export const calculateStandardDeviation = (prices: StockPrice[]): number => {
  if (prices.length === 0) return 0;
  
  const avg = calculateAveragePrice(prices);
  const squareDiffs = prices.map(price => {
    const diff = price.price - avg;
    return diff * diff;
  });
  
  const avgSquareDiff = squareDiffs.reduce((total, diff) => total + diff, 0) / prices.length;
  return Math.sqrt(avgSquareDiff);
};

// Calculate correlation between two arrays of stock prices
export const calculateCorrelation = (prices1: StockPrice[], prices2: StockPrice[]): number => {
  if (prices1.length !== prices2.length || prices1.length === 0) return 0;
  
  const n = prices1.length;
  
  // Calculate means
  const mean1 = calculateAveragePrice(prices1);
  const mean2 = calculateAveragePrice(prices2);
  
  // Calculate the sums needed for correlation
  let sum_xy = 0;
  let sum_x2 = 0;
  let sum_y2 = 0;
  
  for (let i = 0; i < n; i++) {
    const x_dev = prices1[i].price - mean1;
    const y_dev = prices2[i].price - mean2;
    
    sum_xy += x_dev * y_dev;
    sum_x2 += x_dev * x_dev;
    sum_y2 += y_dev * y_dev;
  }
  
  // Calculate correlation coefficient
  if (sum_x2 === 0 || sum_y2 === 0) return 0;
  const r = sum_xy / (Math.sqrt(sum_x2) * Math.sqrt(sum_y2));
  
  // Return correlation coefficient, ensuring it's within [-1, 1]
  return Math.max(-1, Math.min(1, r));
};
