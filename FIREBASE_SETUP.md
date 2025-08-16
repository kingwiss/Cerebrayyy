# Firebase Authentication Setup Guide

This application now uses Firebase Authentication for production-ready user authentication that works both locally and in production.

## Quick Setup Steps

### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select an existing project
3. Follow the setup wizard

### 2. Enable Authentication
1. In your Firebase project, go to **Authentication** > **Sign-in method**
2. Enable **Email/Password** provider
3. Click "Save"

### 3. Get Firebase Configuration
1. Go to **Project Settings** (gear icon) > **General**
2. Scroll down to "Your apps" section
3. If you don't have a web app, click "Add app" and select Web (</>) 
4. Copy the Firebase configuration object

### 4. Update Environment Variables
Replace the placeholder values in `.env` file with your actual Firebase config:

```env
FIREBASE_API_KEY=your-actual-api-key
FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
FIREBASE_PROJECT_ID=your-actual-project-id
FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
FIREBASE_MESSAGING_SENDER_ID=your-actual-sender-id
FIREBASE_APP_ID=your-actual-app-id
```

### 5. Test the Authentication
1. Start your application: `npm start` or `node server.js`
2. Try creating a new account
3. Try signing in with existing credentials
4. Check Firebase Console > Authentication > Users to see registered users

## What Changed

✅ **Fixed Production Issue**: Authentication now works in production, not just localhost

✅ **Replaced localhost API**: Removed hardcoded `http://localhost:8000/api` dependency

✅ **Added Firebase Auth**: Implemented Firebase Authentication with email/password

✅ **Better Error Handling**: User-friendly error messages for common auth issues

✅ **Real-time Auth State**: Automatic user state management across browser sessions

## Features

- **Email/Password Authentication**: Secure user registration and login
- **Production Ready**: Works in any deployment environment
- **Real-time State Management**: Automatic user session handling
- **Error Handling**: Clear, user-friendly error messages
- **Security**: Built on Google's Firebase infrastructure

## Troubleshooting

**"Network error" or connection issues:**
- Check that Firebase config values are correct
- Ensure Authentication is enabled in Firebase Console
- Verify Email/Password provider is enabled

**"Invalid API key" errors:**
- Double-check the API key in your `.env` file
- Make sure there are no extra spaces or quotes

**Users not appearing in Firebase Console:**
- Check that you're looking at the correct Firebase project
- Ensure the project ID matches your configuration

## Security Notes

- Never commit your actual Firebase config to version control
- Use environment variables for all sensitive configuration
- The `.env` file should be in your `.gitignore`
- Firebase handles all security best practices automatically

## Support

For Firebase-specific issues, refer to the [Firebase Documentation](https://firebase.google.com/docs/auth/web/start).