# ⚠️ IMPORTANT: Supabase Setup Required

This project has been migrated from **Firebase** to **Supabase** for authentication.

## 🚨 Before Running the App:

You **MUST** set up Supabase credentials, or the app will not work!

### Quick Steps:

1. **Create a Supabase project** at [https://supabase.com/dashboard](https://supabase.com/dashboard)

2. **Get your credentials** from Settings → API:
   - Project URL
   - anon public key

3. **Update `.env.local`** with your credentials:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

4. **Enable authentication** in Supabase Dashboard:
   - Go to Authentication → Providers
   - Enable **Email** (required)
   - Enable **Google** (optional, for OAuth)

5. **Add redirect URLs** in Authentication → URL Configuration:
   - Add: `http://localhost:9002/auth/callback`

6. **Restart the dev server**:
   ```bash
   npm run dev
   ```

## 📖 Full Instructions:

See `../SUPABASE_SETUP.md` for detailed setup instructions.

## 🆘 Need Help?

- Make sure `.env.local` file exists in the `frontend/` directory
- Check that environment variables start with `NEXT_PUBLIC_`
- Verify Supabase project is created and active
- Try the example values from SUPABASE_SETUP.md

---

**Without Supabase setup, you'll see errors like:**
- "Missing Supabase environment variables"
- Authentication won't work
- Sign up/Login buttons will fail
