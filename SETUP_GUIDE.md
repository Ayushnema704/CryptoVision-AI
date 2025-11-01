# Cryptocurrency Price Predictor - Setup Guide

This project consists of two parts:
- **Backend**: Flask API with ML model (Python)
- **Frontend**: Next.js application (TypeScript/React)

## 🚀 Quick Start

### 1. Start the Flask Backend

```powershell
# Navigate to the root directory
cd "c:\Users\Ayush\Downloads\cryptocurrency_price_predictor-main\cryptocurrency_price_predictor-main"

# Install Python dependencies (if not already installed)
pip install -r requirements.txt

# Start Flask server (runs on port 5000 by default)
python app.py
```

The Flask backend will be available at: `http://localhost:5000`

### 2. Start the Next.js Frontend

Open a **new terminal** and run:

```powershell
# Navigate to the frontend directory
cd "c:\Users\Ayush\Downloads\cryptocurrency_price_predictor-main\cryptocurrency_price_predictor-main\frontend"

# Start Next.js development server (runs on port 9002)
npm run dev
```

The Next.js frontend will be available at: `http://localhost:9002`

## 📡 API Integration

The frontend is now configured to fetch **real predictions** from the Flask backend:

- **Backend API Base URL**: `http://localhost:5000`
- **Prediction Endpoint**: `/api/predict` (POST)
- **Health Check**: `/api/health` (GET)

### Environment Variables

The frontend uses `.env.local` for configuration:
```
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🎯 Features

### Backend (Flask)
- `/api/predict` - Get price predictions for any cryptocurrency
- `/api/health` - Check if the ML model is loaded
- CORS enabled for frontend communication

### Frontend (Next.js)
- Real-time cryptocurrency price predictions
- Interactive charts and visualizations
- AI-powered analysis using Google Genkit
- Dark/Light theme support
- Responsive design with Tailwind CSS

## 🔧 Key Components

### Frontend Files Created/Modified:
- `frontend/src/lib/api.ts` - API service for Flask communication
- `frontend/src/components/dashboard.tsx` - Updated to fetch real data
- `frontend/src/lib/types.ts` - TypeScript types for API responses
- `frontend/.env.local` - Environment configuration

### Backend API Endpoints:
- `POST /api/predict` - Request format:
  ```json
  {
    "stock": "BTC-USD",
    "no_of_days": 10
  }
  ```

## 📊 Supported Cryptocurrencies

- Bitcoin (BTC-USD)
- Ethereum (ETH-USD)
- Any cryptocurrency available on Yahoo Finance

## 🛠️ Development Commands

### Frontend
```powershell
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Backend
```powershell
python app.py        # Start Flask server
```

## ⚠️ Troubleshooting

### Backend not connecting?
1. Make sure Flask is running on port 5000
2. Check if the ML model loaded successfully
3. Visit `http://localhost:5000/api/health` to verify

### CORS errors?
- The Flask app already has CORS enabled via `flask-cors`

### Port conflicts?
- Backend: Change port in `app.py` (default: 5000)
- Frontend: Change port in `package.json` scripts (current: 9002)

## 📝 Next Steps

1. **Start both servers** (Flask + Next.js)
2. **Open** `http://localhost:9002` in your browser
3. **Click "Refresh Data"** to fetch live predictions
4. **Enjoy** real-time cryptocurrency predictions!

---

Made with ❤️ using Flask, Next.js, and TensorFlow
