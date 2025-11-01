# Supabase Setup Guide

This application now uses **Supabase** for authentication instead of Firebase.

## 🚀 Quick Setup

### 1. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Project name**: `cryptovision-ai` (or any name you like)
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is perfect for development
4. Click **"Create new project"** and wait ~2 minutes for setup

### 2. Get Your API Credentials

1. In your Supabase project dashboard, go to **Settings** → **API**
2. Copy these two values:
   - **Project URL** (looks like: `https://xxxxx.supabase.co`)
   - **anon public** key (long string starting with `eyJ...`)

### 3. Update Environment Variables

Open `frontend/.env.local` and replace the placeholder values:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Enable Authentication Providers

#### Enable Email/Password Auth:
1. Go to **Authentication** → **Providers** in Supabase dashboard
2. **Email** should be enabled by default
3. Configure email settings:
   - **Enable email confirmations** (optional, recommended for production)
   - For development, you can disable confirmations

#### Enable Google OAuth (Optional):
1. In **Authentication** → **Providers**, click on **Google**
2. Toggle **"Enable Sign in with Google"**
3. You'll need:
   - **Google Client ID** (from Google Cloud Console)
   - **Google Client Secret** (from Google Cloud Console)

**To get Google OAuth credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Set **Authorized redirect URIs** to:
   - `https://your-project-id.supabase.co/auth/v1/callback` (Supabase callback)
   - `http://localhost:9002/auth/callback` (for local testing)
6. Copy the Client ID and Secret to Supabase

### 5. Configure Redirect URLs

1. Go to **Authentication** → **URL Configuration** in Supabase
2. Add these to **Redirect URLs**:
   - `http://localhost:9002/auth/callback` (for local development)
   - `https://your-production-domain.com/auth/callback` (when you deploy)

### 6. Test Authentication

1. Restart your Next.js dev server:
   ```bash
   cd frontend
   npm run dev
   ```

2. Open [http://localhost:9002](http://localhost:9002)

3. Test the authentication:
   - Click **Sign Up** → Create account with email/password
   - Check your email for confirmation (if enabled)
   - Try **Sign In** with your credentials
   - Try **Google Sign-In** (if configured)

## 🔧 Troubleshooting

### "Missing Supabase environment variables"
- Make sure you've added `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`
- Restart the Next.js dev server after adding variables

### Google OAuth not working
- Verify Google OAuth credentials in Supabase dashboard
- Check that redirect URLs match exactly (including http/https)
- Make sure Google+ API is enabled in Google Cloud Console
- Check browser console for specific error messages

### Email confirmation required
- If you enabled email confirmations, users must click the link in their email
- For development, you can disable this in **Authentication** → **Providers** → **Email** → **"Confirm email"**

### Session not persisting
- Supabase stores sessions in browser localStorage by default
- Clear browser cache and cookies if having issues
- Check that cookies are enabled in your browser

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)

## 🔄 Migration Notes

### What Changed from Firebase:
- ✅ **Auth Provider**: Firebase Auth → Supabase Auth
- ✅ **User ID field**: `user.uid` → `user.id`
- ✅ **OAuth Redirect**: Now handled through `/auth/callback` page
- ✅ **Session Management**: Automatic with Supabase client
- ⚠️ **Database**: Still using SQLite backend (not changed)

### Backend (Flask) Changes:
- No changes required! Backend still uses SQLite
- Backend API endpoints remain the same
- User creation flow unchanged
