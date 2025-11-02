# Hugging Face Spaces Deployment Guide

## Deploy Flask Backend to Hugging Face Spaces

### Step 1: Create a New Space

1. Go to [Hugging Face](https://huggingface.co/) and sign in
2. Click your profile → **New Space**
3. Configure:
   - **Space name**: `cryptovision-api` (or your choice)
   - **License**: MIT
   - **Space SDK**: **Docker** (important!)
   - **Space hardware**: CPU basic (free)
   - **Visibility**: Public (or Private if you have a paid plan)
4. Click **Create Space**

### Step 2: Prepare Files for Upload

You need to upload these files to your HF Space:

**Required files:**
- `app.py` (your Flask app - already exists)
- `requirements.txt` (Python dependencies)
- `Dockerfile` (to run Flask in HF Spaces)
- `.env` (for secrets - add via Spaces UI, not uploaded)
- `model.keras` or `model.h5` (ML model)

### Step 3: Create Dockerfile

Create a `Dockerfile` in your project root with this content:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    build-essential \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application files
COPY app.py .
COPY model.keras .
COPY database_supabase.py .

# Expose port 7860 (HF Spaces default)
EXPOSE 7860

# Set environment variable for Flask
ENV FLASK_APP=app.py
ENV PYTHONUNBUFFERED=1

# Run the app on port 7860
CMD ["python", "-m", "flask", "run", "--host=0.0.0.0", "--port=7860"]
```

### Step 4: Update requirements.txt

Add `gunicorn` for production:

```txt
flask==2.3.3
flask-cors
pandas==2.0.3
numpy==1.24.3
yfinance==0.2.18
scikit-learn==1.3.0
matplotlib==3.7.2
tensorflow==2.12.0
h5py==3.9.0
python-dotenv
supabase-py
gunicorn
```

### Step 5: Update app.py for HF Spaces

Change the last line of `app.py` from:
```python
if __name__ == "__main__":
    app.run(debug=False, host='127.0.0.1', port=5000)
```

To:
```python
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 7860))
    app.run(debug=False, host='0.0.0.0', port=port)
```

### Step 6: Upload Files to HF Space

**Method 1: Using Git (Recommended)**

```bash
# Clone your space
git clone https://huggingface.co/spaces/<your-username>/cryptovision-api
cd cryptovision-api

# Copy files
cp ../app.py .
cp ../requirements.txt .
cp ../Dockerfile .
cp ../model.keras .
cp ../database_supabase.py .

# Commit and push
git add .
git commit -m "Initial deployment"
git push
```

**Method 2: Using Web UI**

1. In your Space, click **Files** tab
2. Click **Add file** → **Upload files**
3. Upload: `app.py`, `requirements.txt`, `Dockerfile`, `model.keras`, `database_supabase.py`
4. Click **Commit**

### Step 7: Set Environment Variables (Secrets)

In your Space settings:

1. Click **Settings** → **Variables and secrets**
2. Add these secrets:
   ```
   SUPABASE_URL = https://ngnmzvcxlpnvshvbljls.supabase.co
   SUPABASE_SERVICE_KEY = your_service_key_here
   USE_SUPABASE = true
   FLASK_ENV = production
   ```

### Step 8: Wait for Build

- HF will build your Docker container (5-10 minutes)
- Watch the logs in the **Logs** tab
- Once built, your API will be available at: `https://<your-username>-cryptovision-api.hf.space`

### Step 9: Test Your API

```bash
curl https://<your-username>-cryptovision-api.hf.space/api/health
```

Should return:
```json
{"status": "ok", "model_loaded": true}
```

### Step 10: Update Vercel Environment Variables

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update or add:
   ```
   NEXT_PUBLIC_API_URL = https://<your-username>-cryptovision-api.hf.space
   ```
3. Redeploy your Vercel frontend

## Troubleshooting

### Build fails with "out of memory"
- Your model is too large for free HF Spaces
- **Solution**: Convert to TFLite or use a paid Space with more RAM

### CORS errors
- Already configured in `app.py` with `CORS(app)`
- If needed, update the origins list in `app.py`:
  ```python
  CORS(app, resources={
      r"/api/*": {
          "origins": ["https://your-vercel-app.vercel.app"],
          "methods": ["GET", "POST", "OPTIONS"],
          "allow_headers": ["Content-Type"],
      }
  })
  ```

### API is slow
- Free HF Spaces sleep after inactivity (cold start ~30s)
- **Solution**: Upgrade to paid Space or use DigitalOcean

### Model doesn't load
- Check logs for TensorFlow errors
- Ensure `model.keras` was uploaded correctly
- Try uploading `model.h5` instead

## Alternative: Lighter Deployment

If the full TensorFlow app is too heavy, I can help you:
1. Convert model to TFLite (much smaller)
2. Use `tflite-runtime` instead of full TensorFlow
3. Deploy on a smaller Docker image

Let me know if you need help with any step!
