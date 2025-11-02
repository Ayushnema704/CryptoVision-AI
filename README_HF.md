---
title: CryptoVision API
emoji: 🔮
colorFrom: purple
colorTo: blue
sdk: docker
pinned: false
license: mit
---

# CryptoVision AI - Cryptocurrency Price Prediction API

This is the backend API for CryptoVision AI, a cryptocurrency price prediction platform powered by LSTM neural networks.

## Features

- 📈 Real-time cryptocurrency price predictions
- 🤖 LSTM-based deep learning model
- 📊 Historical data analysis
- 🔮 Future price forecasting
- 👥 User management with credits system
- 💎 Premium subscription support
- 🎟️ Coupon redemption system

## API Endpoints

### Health Check
```
GET /api/health
```

### Predictions
```
POST /api/predict
Content-Type: application/json

{
  "stock": "BTC-USD",
  "no_of_days": 10
}
```

### User Management
```
POST /api/users
GET /api/users/<uid>
POST /api/users/<uid>/credits
POST /api/users/<uid>/premium
```

## Supported Cryptocurrencies

- Bitcoin (BTC-USD)
- Ethereum (ETH-USD)
- Binance Coin (BNB-USD)
- Cardano (ADA-USD)
- Solana (SOL-USD)
- Ripple (XRP-USD)
- Polkadot (DOT-USD)
- Dogecoin (DOGE-USD)

## Frontend

The frontend is deployed on Vercel: [Your Vercel URL]

## Tech Stack

- Flask (Python web framework)
- TensorFlow/Keras (ML model)
- Supabase (Database)
- yfinance (Stock data)
- scikit-learn (Data preprocessing)

## Environment Variables

Set these in the Spaces settings:

- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_KEY`: Your Supabase service role key
- `USE_SUPABASE`: Set to `true`
- `FLASK_ENV`: Set to `production`

## License

MIT License - see LICENSE file for details
