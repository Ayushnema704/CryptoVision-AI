# 🚀 CryptoPredict AI - Cryptocurrency Price Predictor

An advanced cryptocurrency price prediction system powered by LSTM (Long Short-Term Memory) neural networks. This web application analyzes 10 years of historical data to forecast future cryptocurrency prices with high accuracy.

![Python](https://img.shields.io/badge/Python-3.11-blue.svg)
![TensorFlow](https://img.shields.io/badge/TensorFlow-2.20-orange.svg)
![Flask](https://img.shields.io/badge/Flask-2.3-green.svg)
![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)
![Supabase](https://img.shields.io/badge/Supabase-Auth-green.svg)
![License](https://img.shields.io/badge/License-MIT-yellow.svg)

## ⚠️ IMPORTANT: Authentication Setup Required

This project uses **Supabase** for authentication. You **MUST** set up Supabase before running the app.

👉 **See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions**

## ✨ Features

- **🧠 Deep Learning**: LSTM neural networks trained on millions of historical data points
- **📊 Real-Time Data**: Fetches live cryptocurrency prices from Yahoo Finance
- **🔮 Future Forecasts**: Predict prices up to 100 days ahead
- **📈 Visual Analytics**: Interactive charts showing historical trends and predictions
- **📉 Model Metrics**: MSE and RMSE metrics for model performance evaluation
- **🎨 Modern UI**: Beautiful, responsive dark-themed interface built with Next.js
- **💰 Multiple Cryptos**: Supports Bitcoin, Ethereum, and 100+ cryptocurrencies
- **🔐 User Authentication**: Secure login with email/password or Google OAuth via Supabase
- **💳 Credits System**: Free tier with 6 credits, 3 credits per prediction
- **👑 Premium Plans**: Monthly and annual subscriptions with unlimited predictions

## 🖼️ Screenshots

### Homepage
Modern, intuitive interface with popular cryptocurrency quick-select buttons and comprehensive model information.

### Prediction Results
Detailed visualizations including:
- Historical price trends
- Model validation charts
- Future price forecasts
- Prediction accuracy metrics
- Day-by-day forecast table with trend indicators

## 🛠️ Technologies Used

- **Backend**: Python 3.11, Flask 2.3
- **Machine Learning**: TensorFlow 2.20, Keras, scikit-learn
- **Data Processing**: Pandas, NumPy, yfinance
- **Visualization**: Matplotlib
- **Frontend**: HTML5, CSS3, Bootstrap 5, Font Awesome
- **Model Architecture**: LSTM (Long Short-Term Memory) Neural Network

## 📋 Prerequisites

- Python 3.11 or higher
- pip package manager
- 2GB+ RAM recommended
- Internet connection (for fetching live data)

## 🚀 Installation & Setup

1. **Clone the repository**
```bash
cd cryptocurrency_price_predictor-main
```

2. **Create and activate virtual environment**
```bash
# The virtual environment is already set up in .venv
.\.venv\Scripts\Activate.ps1  # Windows PowerShell
```

3. **Install dependencies**
```bash
pip install -r requirements.txt
```

4. **Run the application**
```bash
python app.py
```

5. **Open in browser**
```
http://127.0.0.1:5000
```

## 📦 Dependencies

```
flask==2.3.3
pandas==2.0.3
numpy==1.24.3
yfinance==0.2.18
scikit-learn==1.3.0
matplotlib==3.7.2
tensorflow==2.12.0
h5py==3.9.0
```

## 🎯 How to Use

1. **Select a Cryptocurrency**: Choose from popular options (BTC-USD, ETH-USD, etc.) or enter any valid Yahoo Finance ticker
2. **Set Prediction Horizon**: Choose how many days ahead you want to predict (1-100 days)
3. **Generate Prediction**: Click "Generate Prediction" to run the model
4. **Analyze Results**: Review the charts, metrics, and detailed forecast table

## 🧪 Model Architecture

The prediction model uses:
- **Input Layer**: 100 time steps of historical price data
- **LSTM Layers**: Multiple stacked LSTM layers for pattern recognition
- **Output Layer**: Single price prediction
- **Training Data**: 10 years of historical cryptocurrency prices
- **Normalization**: MinMaxScaler fitted on entire dataset for robustness

## 📊 Model Performance

- **Training**: Model trained on 90% of historical data
- **Testing**: Validated on remaining 10% of data
- **Metrics**: MSE (Mean Squared Error) and RMSE (Root Mean Squared Error)
- **Optimization**: Adam optimizer with mean squared error loss

## ⚠️ Important Disclaimers

1. **Not Financial Advice**: This tool is for educational and research purposes only
2. **Market Volatility**: Cryptocurrency markets are highly unpredictable
3. **Model Limitations**: Past performance does not guarantee future results
4. **Risk Warning**: Always conduct your own research before investing

## 🔧 Technical Features

### Data Preprocessing
- Fetches 10 years of historical data
- MinMaxScaler normalization (fitted on entire dataset)
- Sliding window approach (100-day sequences)
- Train/test split (90/10)

### Model Features
- LSTM neural network architecture
- Handles time-series dependencies
- Robust to out-of-range predictions
- Real-time inference

### Frontend Features
- Responsive design (mobile-friendly)
- Dark theme optimized for readability
- Interactive ticker selection
- Real-time chart generation
- Detailed performance metrics

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

Created with ❤️ for cryptocurrency enthusiasts and data science learners

## 🙏 Acknowledgments

- TensorFlow & Keras teams for the ML framework
- Yahoo Finance for providing free financial data APIs
- Bootstrap team for the UI framework
- The open-source community

---

**⚡ Built with cutting-edge AI technology for the future of crypto trading analysis**