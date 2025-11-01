# Razorpay Payment Integration Setup Guide

## 🔐 Step 1: Create Razorpay Account

1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com/signup)
2. Sign up with your email and business details
3. Complete KYC verification (required for live payments)

## 🔑 Step 2: Get API Keys

### For Testing (Test Mode):
1. Login to [Razorpay Dashboard](https://dashboard.razorpay.com/)
2. Make sure you're in **Test Mode** (toggle at top)
3. Go to **Settings** → **API Keys**
4. Click **Generate Test Keys**
5. Copy the **Key ID** (starts with `rzp_test_`)

### For Production (Live Mode):
1. Complete KYC verification
2. Switch to **Live Mode**
3. Go to **Settings** → **API Keys**
4. Click **Generate Live Keys**
5. Copy the **Key ID** (starts with `rzp_live_`)

## 📝 Step 3: Configure Environment Variables

Add your Razorpay Key ID to `.env.local`:

```bash
# For Testing
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX

# For Production (after KYC)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
```

## 💰 Step 4: Update Payment Amounts

Edit `frontend/src/lib/razorpay.ts` to set your pricing:

```typescript
export const PAYMENT_PLANS = {
  monthly: {
    amount: 99900, // ₹999 or $9.99 (in smallest currency unit)
    currency: 'INR', // or 'USD'
    displayAmount: '₹999', // or '$9.99'
    // ...
  },
  annual: {
    amount: 959900, // ₹9,599 or $95.99
    currency: 'INR', // or 'USD'
    displayAmount: '₹9,599', // or '$95.99'
    // ...
  },
};
```

**Important**: 
- For INR: Amount in **paise** (₹100 = 10000 paise)
- For USD: Amount in **cents** ($10.00 = 1000 cents)

## 🧪 Step 5: Test Payment Flow

### Test Cards (Test Mode Only):

**Success:**
- Card Number: `4111 1111 1111 1111`
- CVV: Any 3 digits
- Expiry: Any future date

**Failure:**
- Card Number: `4000 0000 0000 0002`
- CVV: Any 3 digits
- Expiry: Any future date

### Test UPI:
- VPA: `success@razorpay`

### Test Netbanking:
- Select any bank
- Use "Success" or "Failure" options

## 🔄 Step 6: Webhook Setup (Optional but Recommended)

For production, set up webhooks to handle payment confirmations:

1. Go to **Settings** → **Webhooks**
2. Add webhook URL: `https://yourdomain.com/api/webhooks/razorpay`
3. Select events: `payment.captured`, `payment.failed`
4. Copy the **Webhook Secret**
5. Create API route to handle webhooks

## 🚀 Step 7: Go Live

1. Complete KYC verification
2. Switch to Live Mode
3. Update environment variable with Live Key
4. Test with real small amount
5. Enable in production

## 📊 Payment Flow

1. User clicks "Subscribe Monthly" or "Subscribe Annually"
2. Razorpay checkout modal opens
3. User completes payment (Card/UPI/NetBanking/Wallet)
4. On success:
   - `handlePaymentSuccess()` is called
   - User's `isPremium` is set to `true` in Firestore
   - Page reloads to show Premium status
5. On failure/cancel:
   - Toast notification shown
   - User remains on Free plan

## 🛡️ Security Notes

- ✅ **Never** expose Key Secret (only use Key ID in frontend)
- ✅ Key ID is safe to use in client-side code
- ✅ All payment processing happens on Razorpay's secure servers
- ✅ Verify payments on backend using webhooks (recommended)

## 💡 Features Supported

- ✅ Credit/Debit Cards (Visa, Mastercard, Amex, Rupay)
- ✅ UPI (Google Pay, PhonePe, Paytm, etc.)
- ✅ Net Banking (50+ banks)
- ✅ Wallets (Paytm, Mobikwik, etc.)
- ✅ EMI (for eligible cards)
- ✅ International Cards (with currency conversion)

## 📞 Support

- Documentation: https://razorpay.com/docs/
- Test Credentials: https://razorpay.com/docs/payments/payments/test-card-details/
- Support: https://razorpay.com/support/

## 🔍 Testing Checklist

- [ ] Razorpay account created
- [ ] Test API Key obtained
- [ ] Environment variable configured
- [ ] Dev server restarted
- [ ] Test payment with success card
- [ ] Test payment cancellation
- [ ] Verify Premium status updates in Firestore
- [ ] Check toast notifications work
- [ ] Test both Monthly and Annual plans

## 🎉 You're Ready!

Your Razorpay integration is complete. Users can now purchase Premium subscriptions!
