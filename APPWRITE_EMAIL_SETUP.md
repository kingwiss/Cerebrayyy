# Appwrite Email Configuration for Password Reset

## Problem
Password reset emails are not being sent because Appwrite requires email service configuration.

## Solution: Configure Email Service in Appwrite Console

### Step 1: Access Appwrite Console
1. Go to [Appwrite Console](https://cloud.appwrite.io)
2. Sign in to your account
3. Select your project: `68930d9a002e313013dc`

### Step 2: Configure Email Service
1. In the left sidebar, click on **"Settings"**
2. Click on **"Email"** tab
3. You'll see email service configuration options

### Step 3: Choose Email Provider
You have several options:

#### Option A: SMTP (Recommended for production)
- **Provider**: Custom SMTP
- **Host**: Your SMTP server (e.g., smtp.gmail.com, smtp.mailgun.org)
- **Port**: Usually 587 or 465
- **Username**: Your email username
- **Password**: Your email password or app password
- **Secure**: Enable TLS/SSL

#### Option B: Mailgun (Easy setup)
- **Provider**: Mailgun
- **API Key**: Your Mailgun API key
- **Domain**: Your Mailgun domain

#### Option C: SendGrid (Popular choice)
- **Provider**: SendGrid
- **API Key**: Your SendGrid API key

#### Option D: For Testing - Use Appwrite's Test Email
- **Provider**: Test (for development only)
- This will log emails to console instead of sending them

### Step 4: Configure Email Templates with Cerebray Branding

## 🎨 Custom Email Branding for Cerebray

### 📋 Complete Branding Guide
For comprehensive email branding instructions, templates, and best practices, see:
**[CEREBRAY_EMAIL_BRANDING_GUIDE.md](./CEREBRAY_EMAIL_BRANDING_GUIDE.md)**

### 📧 Available Email Templates
We've created professional, branded email templates for all Cerebray communications:

1. **Password Reset Email** - `email-templates/password-reset-template.html`
2. **Email Verification** - `email-templates/email-verification-template.html`  
3. **Welcome Email** - `email-templates/welcome-email-template.html`

### ⚡ Quick Setup
1. **Configure Email Service** (follow steps above)
2. **Set Branding**:
   - From Name: `Cerebray - Brain Training Platform`
   - From Email: `noreply@cerebray.com` (or your domain)
3. **Upload Templates**:
   - Go to Appwrite Console → Settings → Email → Templates
   - Select template type (Password Recovery, Email Verification, etc.)
   - Copy content from corresponding template file
   - Update subject lines with Cerebray branding
4. **Test All Templates**

### 🎯 Subject Line Examples
- Password Reset: `🧠 Reset Your Cerebray Password`
- Email Verification: `🧠 Verify Your Cerebray Email Address`
- Welcome: `🎉 Welcome to Cerebray - Start Your Brain Training Journey!`

### Step 5: Set Branded From Email Address
1. Set **"From Name"**: `Cerebray - Brain Training Platform`
2. Set **"From Email"**: A professional email address like:
   - `noreply@cerebray.com` (if you have a custom domain)
   - `support@cerebray.com` (for support-related emails)
   - Or use your current email with proper branding

### Step 6: Test the Configuration
1. Save the email configuration
2. Go back to your website
3. Try the "Forgot Password" feature
4. Check if the email is received

## Quick Setup for Development (Gmail SMTP)

If you want to use Gmail for testing:

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password**:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
3. **Configure in Appwrite**:
   - Provider: SMTP
   - Host: `smtp.gmail.com`
   - Port: `587`
   - Username: `your-email@gmail.com`
   - Password: `your-app-password` (not your regular password)
   - Secure: Yes (TLS)

## Environment Variables (if using self-hosted Appwrite)

If you're using self-hosted Appwrite, add these to your `.env` file:

```env
_APP_SMTP_HOST=smtp.gmail.com
_APP_SMTP_PORT=587
_APP_SMTP_SECURE=tls
_APP_SMTP_USERNAME=your-email@gmail.com
_APP_SMTP_PASSWORD=your-app-password
```

## Troubleshooting

### Email not received?
1. Check spam/junk folder
2. Verify email configuration in Appwrite console
3. Check Appwrite logs for email sending errors
4. Ensure the "From Email" is properly configured

### Invalid reset link?
1. Check if the reset URL in email template includes `{{url}}`
2. Verify the reset-password.html page is accessible
3. Check browser console for JavaScript errors

### Rate limiting?
- Appwrite has rate limits for password reset requests
- Wait a few minutes between attempts

## Current Implementation Status

✅ **Code Implementation**: Complete
- Password reset form in auth modal
- Reset password page (`reset-password.html`)
- Proper Appwrite SDK integration

❌ **Email Service**: Needs configuration
- No email service configured in Appwrite
- This is why emails are not being sent

## Next Steps

1. **Immediate**: Configure email service in Appwrite Console
2. **Test**: Try password reset after configuration
3. **Optional**: Customize email templates for better branding