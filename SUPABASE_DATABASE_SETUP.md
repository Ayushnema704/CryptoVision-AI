# Supabase Database Setup Guide

This guide will help you set up the Supabase database to replace SQLite.

## 📋 Prerequisites

- Supabase account and project created
- Project URL and anon key already in `frontend/.env.local`
- Access to Supabase SQL Editor

## 🗄️ Step 1: Run the Database Schema

1. Go to your Supabase project dashboard
2. Click on **SQL Editor** in the left sidebar
3. Click **New Query**
4. Open the file `supabase_schema.sql` from the project root
5. Copy the entire contents and paste into the SQL Editor
6. Click **Run** (or press Ctrl/Cmd + Enter)
7. Wait for success message: "Success. No rows returned"

This will create:
- ✅ `users` table (with credits, premium status, admin flag)
- ✅ `predictions` table (history of all predictions)
- ✅ `coupons` table (coupon codes for credits/premium)
- ✅ `coupon_redemptions` table (tracks redemptions)
- ✅ Row Level Security (RLS) policies
- ✅ Indexes for performance
- ✅ Triggers for auto-updates

## 🔑 Step 2: Get Service Role Key

The backend needs a **service role key** (not the anon key) to bypass RLS:

1. In Supabase dashboard, go to **Settings** → **API**
2. Scroll down to **Project API keys**
3. Find **`service_role`** key (starts with `eyJ...`)
4. Click **Reveal** and copy it
5. ⚠️ **IMPORTANT**: Keep this secret! It has full database access

## ⚙️ Step 3: Configure Backend Environment

1. Open `.env` in the project root
2. Update with your credentials:

```bash
# Supabase Configuration
SUPABASE_URL=https://ngnmzvcxlpnvshvbljls.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key-here

# Enable Supabase (set to true)
USE_SUPABASE=true

# Flask Configuration
FLASK_ENV=development
FLASK_DEBUG=False
```

3. Save the file

## 🔄 Step 4: Verify Table Creation

1. In Supabase dashboard, go to **Table Editor**
2. You should see these tables:
   - `users`
   - `predictions`
   - `coupons`
   - `coupon_redemptions`
3. Click on `users` table
4. Verify columns: uid, email, credits, is_premium, is_admin, etc.

## 🧪 Step 5: Test the Setup

1. Stop your Flask server (if running)
2. Restart Flask:
   ```bash
   python app.py
   ```
3. You should see: `✅ Supabase database connected: https://ngnmzvcxlpnvshvbljls.supabase.co`
4. Test sign up:
   - Go to http://localhost:9002
   - Sign up with email/password
   - Check Supabase Table Editor → `users` table
   - Your user should appear!

## 🔐 Step 6: Verify RLS Policies

Row Level Security ensures users can only access their own data:

1. In Supabase dashboard, go to **Authentication** → **Policies**
2. Select `users` table
3. Verify policies exist:
   - "Users can view their own data"
   - "Users can update their own data"
4. Select `predictions` table
5. Verify policies:
   - "Users can view their own predictions"
   - "Users can insert their own predictions"

## 👑 Step 7: Test Admin Features

1. Sign up with `ayushnema2468@gmail.com`
2. Check Table Editor → `users` table
3. Your user should have `is_admin = true` ✅
4. Test admin endpoints:
   ```bash
   curl http://localhost:5000/api/admin/stats
   ```

## 🎯 Benefits of Supabase vs SQLite

| Feature | SQLite | Supabase |
|---------|--------|----------|
| **Scalability** | Single file | Cloud-hosted Postgres |
| **Concurrent Users** | Limited | Unlimited |
| **Backups** | Manual | Automatic daily |
| **Real-time** | No | Yes (with subscriptions) |
| **Remote Access** | No | Yes (from anywhere) |
| **Free Tier** | Free | Free (500MB, 50K monthly active users) |

## 🔄 Switching Back to SQLite

If you want to use SQLite again:

1. Open `.env`
2. Set `USE_SUPABASE=false` (or remove the line)
3. Restart Flask server

The app will automatically use `database.py` (SQLite) instead of `database_supabase.py`.

## 🛠️ Troubleshooting

### "Missing SUPABASE_URL or SUPABASE_SERVICE_KEY"
- Check `.env` file exists in project root
- Verify variables are set correctly
- Make sure no quotes around values
- Restart Flask after changes

### "Connection refused" or "Network error"
- Verify Supabase project is active
- Check SUPABASE_URL is correct
- Test connection in Supabase dashboard

### "Row Level Security" errors
- Make sure you're using the **service_role** key (not anon key)
- Service role key bypasses RLS
- Verify policies were created by running `supabase_schema.sql`

### Tables not created
- Go to SQL Editor and run `supabase_schema.sql` again
- Check for syntax errors in output
- Make sure you're connected to the right project

### Admin features not working
- Sign up with exact email: `ayushnema2468@gmail.com`
- Check `is_admin` column in Table Editor
- Trigger only works on INSERT, not existing users

## 📊 Monitoring

Track your database usage:

1. Supabase Dashboard → **Database** → **Database**
2. View:
   - **Size**: Current database size
   - **Connections**: Active connections
   - **Rows**: Total rows across tables
3. Set up alerts for approaching limits

## 🚀 Next Steps

- ✅ Database is cloud-hosted and scalable
- ✅ Automatic backups (Point-in-time recovery)
- ✅ Real-time subscriptions available
- ✅ Ready for production deployment

Your app is now using Supabase! 🎉
