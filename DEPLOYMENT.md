# Deployment Guide

## Architecture

- **Frontend**: Deploy to Vercel (Next.js)
- **Backend**: Deploy to Railway/Render (Flask + TensorFlow)

## Backend Deployment (Railway - Recommended)

### Option 1: Railway (Easiest)

1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select `CryptoVision-AI` repository
5. Add environment variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_key
   USE_SUPABASE=true
   FLASK_ENV=production
   PORT=5000
   ```
6. Railway will auto-deploy using `railway.json` config
7. Copy your Railway URL (e.g., `https://your-app.railway.app`)

### Option 2: Render

1. Go to [render.com](https://render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repo
4. Configure:
   - **Name**: cryptovision-backend
   - **Root Directory**: (leave empty)
   - **Environment**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python app.py`
5. Add environment variables (same as above)
6. Click "Create Web Service"
7. Copy your Render URL

## Frontend Deployment (Vercel)

1. Go to [vercel.com](https://vercel.com)
2. Click "Import Project"
3. Select your GitHub repository
4. Configure:
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
5. Add environment variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_RAZORPAY_KEY_ID=your_razorpay_key
   ```
6. Click "Deploy"

## Important Notes

- **TensorFlow is too large for Vercel serverless functions** (500MB limit)
- Backend must be deployed separately to Railway, Render, or similar
- Update `NEXT_PUBLIC_API_URL` in frontend to point to deployed backend
- Both Railway and Render offer free tiers perfect for this app

## Testing Deployment

1. Backend health check: `https://your-backend-url.railway.app/health`
2. Frontend: `https://your-app.vercel.app`

## Alternative: Deploy Both to Railway

You can also deploy both frontend and backend to Railway:
1. Deploy backend first (get URL)
2. Deploy frontend with backend URL in env vars
