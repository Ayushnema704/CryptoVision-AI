export type PriceHistory = {
  time: string;
  price: number;
  type: 'historical' | 'predicted';
};

export type ChartDataPoint = {
  date: string;
  price: number;
};

export type PredictionData = {
  name: string;
  symbol: string;
  currentPrice: number;
  predictedPrice: number;
  change: number;
  changePercent: number;
  confidence: number;
  history?: PriceHistory[];
  chartData?: ChartDataPoint[];
  futurePredictions?: number[];
  accuracy?: {
    mse: number;
    rmse: number;
  };
};
