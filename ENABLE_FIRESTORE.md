# Quick Fix: Enable Firestore Database

## ⚠️ Current Issue
You're seeing `FirebaseError: Failed to get document because the client is offline` because **Firestore Database is not enabled** in your Firebase project.

## ✅ Quick Fix (2 minutes)

### Step 1: Enable Firestore
1. Go to: https://console.firebase.google.com/project/cryptovision-ai-b6907/firestore
2. Click **"Create Database"** button
3. Choose **"Start in production mode"**
4. Select your location (e.g., `us-central1`)
5. Click **"Enable"**

### Step 2: Update Security Rules
After database is created:
1. Click the **"Rules"** tab
2. Replace the rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## 🎉 That's It!

Your app will now:
- ✅ Store user data in Firestore
- ✅ Track credits properly
- ✅ Sync premium status
- ✅ No more offline errors

## 💡 What We've Done

I've already added **fallback handling** in your code:
- If Firestore is offline → Uses default 5 free credits
- If Firestore works → Syncs data properly
- Errors are suppressed in console

So your app **works right now** with default credits, but enabling Firestore will give you:
- Persistent credit tracking
- Premium subscription storage
- Multi-device sync

---

**Direct Link**: https://console.firebase.google.com/project/cryptovision-ai-b6907/firestore
