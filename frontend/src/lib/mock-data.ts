import type { PredictionData, PriceHistory } from '@/lib/types';

const generateHistory = (startPrice: number, seed: number): PriceHistory[] => {
  const history: PriceHistory[] = [];
  let price = startPrice;

  // Deterministic price changes to avoid hydration mismatch
  const changes = [
    -0.015, 0.012, -0.008, 0.018, -0.005, 0.009, -0.013, 0.007,
    0.011, -0.006, 0.014, -0.010, 0.016, -0.004, 0.008, -0.012,
    0.006, -0.009, 0.013, -0.007, 0.010, -0.011, 0.015
  ];

  // Generate 23 hours of historical data
  for (let i = 23; i > 0; i--) {
    history.push({
      time: `${i}h ago`,
      price: parseFloat(price.toFixed(2)),
      type: 'historical',
    });
    price *= (1 + changes[(i + seed) % changes.length]);
  }
  
  // Current price
  history.push({
    time: 'Now',
    price: parseFloat(startPrice.toFixed(2)),
    type: 'historical',
  });

  return history;
};

const generatePrediction = (history: PriceHistory[], increase: number): PriceHistory[] => {
    const lastHistorical = history[history.length - 1];
    const predictedPrice = lastHistorical.price * (1 + increase);

    return [
        ...history,
        {
            time: '1h ahead',
            price: parseFloat(predictedPrice.toFixed(2)),
            type: 'predicted',
        }
    ];
};

const btcStartPrice = 68456.78;
const btcHistory = generateHistory(btcStartPrice, 0);
const btcFullHistory = generatePrediction(btcHistory, 0.008);

export const MOCK_BITCOIN_DATA: PredictionData = {
  name: 'Bitcoin',
  symbol: 'BTC',
  currentPrice: btcStartPrice,
  predictedPrice: btcFullHistory[btcFullHistory.length - 1].price,
  change: btcFullHistory[btcFullHistory.length - 1].price - btcStartPrice,
  changePercent: ((btcFullHistory[btcFullHistory.length - 1].price - btcStartPrice) / btcStartPrice) * 100,
  confidence: 92,
  history: btcFullHistory,
};


const ethStartPrice = 3567.12;
const ethHistory = generateHistory(ethStartPrice, 5);
const ethFullHistory = generatePrediction(ethHistory, 0.012);

export const MOCK_ETHEREUM_DATA: PredictionData = {
  name: 'Ethereum',
  symbol: 'ETH',
  currentPrice: ethStartPrice,
  predictedPrice: ethFullHistory[ethFullHistory.length - 1].price,
  change: ethFullHistory[ethFullHistory.length - 1].price - ethStartPrice,
  changePercent: ((ethFullHistory[ethFullHistory.length - 1].price - ethStartPrice) / ethStartPrice) * 100,
  confidence: 88,
  history: ethFullHistory,
};
