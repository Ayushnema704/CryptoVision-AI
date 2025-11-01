# Quick Setup - Supabase Database

## ⚡ 3-Step Setup

### 1. Run SQL Schema
```
1. Go to: https://ngnmzvcxlpnvshvbljls.supabase.co/project/ngnmzvcxlpnvshvbljls/sql
2. Click "New Query"
3. Paste contents of `supabase_schema.sql`
4. Click "Run" ✅
```

### 2. Get Service Key
```
1. Go to: Settings → API
2. Copy "service_role" key (NOT anon key!)
3. Paste into `.env` file
```

### 3. Update .env
```bash
# In project root .env file:
SUPABASE_URL=https://ngnmzvcxlpnvshvbljls.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here
USE_SUPABASE=true
```

## 🧪 Test It
```bash
# Restart Flask
python app.py

# Should see:
# ✅ Supabase database connected
```

## 📝 What You Get

✅ Users table (cloud-hosted)
✅ Credits system (6 credits, -3 per use)
✅ Premium subscriptions
✅ Coupon system
✅ Admin features
✅ Automatic backups
✅ Scalable to millions of users

## 🔄 Switch Back to SQLite

```bash
# In .env file:
USE_SUPABASE=false
```

That's it! 🎉
