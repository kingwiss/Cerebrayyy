# 🚀 PayPal Payment Integration Setup Guide

## Overview
This guide will help you set up PayPal payments for your Cerebray Premium app, transitioning from sandbox (test) to live (production) payments.

## Current Status
✅ **Stripe Integration Removed** - All Stripe code has been cleaned up
✅ **PayPal-Only Payment System** - Only PayPal is used for payments
⚠️ **Currently Using Sandbox** - Test credentials are active

## 🔧 Setting Up Production PayPal

### Step 1: Get Your PayPal Business Account
1. Go to [PayPal Business](https://www.paypal.com/us/business)
2. Sign up for a business account or upgrade your personal account
3. Complete business verification process

### Step 2: Create PayPal Developer App
1. Go to [PayPal Developer Dashboard](https://developer.paypal.com/developer/applications/)
2. Log in with your PayPal business account
3. Click **"Create App"**
4. Fill in:
   - **App Name**: "Cerebray Premium Subscriptions"
   - **Merchant**: Select your business account
   - **Features**: Check "Subscriptions"
5. Click **"Create App"**

### Step 3: Get Live Credentials
1. In your app dashboard, toggle from **"Sandbox"** to **"Live"**
2. Copy your **Live Client ID**
3. Copy your **Live Client Secret** (you won't need this for frontend)

### Step 4: Create Subscription Plan
1. In PayPal Developer Dashboard, go to **"Subscriptions"**
2. Click **"Create Plan"**
3. Set up your plan:
   - **Plan Name**: "Cerebray Premium Monthly"
   - **Plan ID**: (PayPal will generate this - copy it!)
   - **Price**: $4.99 USD
   - **Billing Cycle**: Monthly
   - **Setup Fee**: $0
4. Save the plan and copy the **Plan ID**

### Step 5: Update Your App Configuration
1. Open your `.env` file
2. Replace the sandbox credentials:
```env
# PayPal Configuration (LIVE - Production)
PAYPAL_CLIENT_ID=your_live_client_id_here
PAYPAL_PLAN_ID=your_live_plan_id_here
```

### Step 6: Test the Payment Flow
1. Restart your server: `node server.js`
2. Open `http://localhost:5000/payment.html`
3. Enter a real email address
4. Click the PayPal button
5. **Use a real PayPal account** (not test cards)
6. Complete the payment
7. Verify premium access is granted

## 🧪 Testing Checklist

### Before Going Live:
- [ ] PayPal business account verified
- [ ] Live app created in PayPal Developer Dashboard
- [ ] Subscription plan created with correct pricing
- [ ] Live credentials added to `.env` file
- [ ] Server restarted with new credentials
- [ ] Test payment completed successfully
- [ ] Premium features activated after payment
- [ ] User receives confirmation email from PayPal

### Test Payment Flow:
1. **Payment Page Loading**:
   - [ ] PayPal button renders correctly
   - [ ] No console errors
   - [ ] Email validation works

2. **PayPal Checkout**:
   - [ ] PayPal popup opens
   - [ ] Can log in with real PayPal account
   - [ ] Subscription details show correct price ($4.99)
   - [ ] Payment completes successfully

3. **Premium Activation**:
   - [ ] User is redirected back to app
   - [ ] Premium status is activated
   - [ ] Premium features are accessible
   - [ ] User data is saved correctly

## 🔍 Troubleshooting

### Common Issues:

**PayPal Button Not Loading:**
- Check browser console for errors
- Verify Client ID is correct
- Ensure server is running on correct port

**Payment Fails:**
- Verify Plan ID matches your PayPal subscription plan
- Check that business account is verified
- Ensure subscription plan is active

**Premium Not Activated:**
- Check server logs for API errors
- Verify `/api/paypal-subscription-success` endpoint is working
- Check `users.json` file for user data

### Debug Tools:
- Browser Developer Console
- Server logs (`node server.js`)
- PayPal Developer Dashboard transaction logs
- Network tab to check API calls

## 🚨 Security Notes

1. **Never commit live credentials** to version control
2. **Use HTTPS in production** - PayPal requires secure connections
3. **Validate all payments server-side** - Don't trust client-side data
4. **Monitor transactions** regularly in PayPal dashboard

## 📞 Support

If you encounter issues:
1. Check PayPal Developer Documentation
2. Review server logs for specific error messages
3. Test with PayPal's sandbox first if needed
4. Contact PayPal Developer Support for payment-specific issues

---

**Next Steps**: Once you've completed the setup, test a real payment to ensure everything works correctly before launching to users.