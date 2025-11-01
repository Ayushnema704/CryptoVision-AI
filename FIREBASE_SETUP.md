# Firebase Setup Guide for CryptoVision AI

## Overview
This guide will help you set up Firebase Authentication and Firestore for the CryptoVision AI application.

## Prerequisites
- A Google account
- Node.js and npm installed

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `cryptovision-ai` (or your preferred name)
4. Disable Google Analytics (optional)
5. Click "Create project"

## Step 2: Enable Authentication

1. In Firebase Console, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Enable the following sign-in methods:
   - **Email/Password**: Click on it, toggle "Enable", and save
   - **Google**: Click on it, toggle "Enable", enter project support email, and save

## Step 3: Create Firestore Database

1. Click on "Firestore Database" in the left sidebar
2. Click "Create database"
3. Select "Start in production mode"
4. Choose your preferred location (e.g., `us-central1`)
5. Click "Enable"

### Set up Firestore Security Rules

Once the database is created, go to the "Rules" tab and replace with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only read/write their own user document
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon (⚙️) next to "Project Overview"
2. Click "Project settings"
3. Scroll down to "Your apps"
4. Click the web icon (`</>`) to add a web app
5. Register app with nickname: "CryptoVision Web"
6. Copy the `firebaseConfig` object

## Step 5: Configure Environment Variables

1. In the `frontend` directory, create a `.env.local` file:

```bash
cd frontend
cp .env.local.example .env.local
```

2. Edit `.env.local` and paste your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-actual-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-actual-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-actual-app-id
```

## Step 6: Test the Application

1. Restart your development server:

```bash
npm run dev
```

2. Visit `http://localhost:9002`
3. Click "Sign In" in the navbar
4. Try creating an account or signing in with Google

## Features Implemented

### Authentication
- ✅ Email/Password signup and login
- ✅ Google OAuth login
- ✅ User session persistence
- ✅ Logout functionality

### Credit System
- ✅ Free users get **5 prediction credits**
- ✅ Each prediction consumes 1 credit
- ✅ Premium users get **unlimited predictions**
- ✅ Credit balance displayed in account page and navbar

### Protected Routes
- ✅ AI CryptoPredictor page requires authentication
- ✅ Automatic credit check before showing predictions
- ✅ Redirects to account page when credits run out

### User Account Page
- ✅ View profile information
- ✅ See subscription status (Free/Premium)
- ✅ Track remaining credits
- ✅ Upgrade to Premium button (you can implement payment later)

## Database Structure

### Users Collection (`users`)

```javascript
{
  email: "user@example.com",
  credits: 5,              // Number of predictions remaining
  isPremium: false,        // true for premium users
  createdAt: "2025-10-27T..."
}
```

## Making a User Premium (Manual for now)

Since payment integration isn't implemented yet, you can manually make a user premium:

1. Go to Firebase Console → Firestore Database
2. Find the user document in `users` collection
3. Edit the document and set:
   - `isPremium: true`
   - `credits: 999999`

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Make sure `.env.local` exists and has correct values
- Restart the development server after creating `.env.local`

### "Missing or insufficient permissions"
- Check Firestore security rules
- Make sure the user is signed in
- Verify the user document exists in Firestore

### Credits not decreasing
- Check browser console for errors
- Verify Firestore rules allow writes to user document
- Make sure you're signed in

## Next Steps

1. **Implement Payment Integration** (Stripe, PayPal, etc.)
2. **Add email verification** for new signups
3. **Implement password reset** functionality
4. **Add admin panel** to manage users and credits
5. **Track prediction history** in Firestore

## Support

For issues or questions, check the Firebase documentation:
- [Firebase Auth](https://firebase.google.com/docs/auth)
- [Firestore](https://firebase.google.com/docs/firestore)
