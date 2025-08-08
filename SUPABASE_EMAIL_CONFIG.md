# Supabase Email Configuration Guide

## Issue: Sign-up emails only sent once

### Root Cause

Supabase only sends confirmation emails once per email address to prevent spam. If a user doesn't confirm their email and tries to sign up again, no new email is sent.

### Solutions Implemented

#### 1. Added Resend Confirmation Functionality

- New `resendConfirmation` function in the store
- Resend confirmation button in the signup form
- Automatic resend when user tries to sign up with existing email

#### 2. Improved Signup Flow

- Detects when user already exists
- Automatically triggers resend confirmation
- Better error handling and user feedback

### Supabase Dashboard Configuration

#### Required Settings:

1. **Authentication > Settings**

   - ✅ Enable email confirmations
   - ✅ Set confirmation URL: `${VITE_APP_URL}/auth/callback`
   - ✅ Enable secure email change

2. **Authentication > URL Configuration**

   - Site URL: Use your production domain (e.g., `https://your-domain.com`)
   - Redirect URLs:
     - `https://your-domain.com/auth/callback` (production)
     - `http://localhost:5174/auth/callback` (development)

3. **Environment Variables Configuration**

   - Set `VITE_APP_URL` to your production domain
   - This ensures email links redirect to the correct URL
   - Development: `VITE_APP_URL=http://localhost:5174`
   - Production: `VITE_APP_URL=https://your-domain.com`

4. **Authentication > Email Templates**
   - Customize confirmation email template if needed
   - Ensure "Confirm signup" template is enabled

#### Optional Improvements:

1. **Authentication > Settings**

   - Consider disabling email confirmations for development
   - Set up custom SMTP for production (recommended)

2. **Database > Functions**
   - Add trigger to automatically create profile on signup
   - Add RLS policies for user data

### Testing the Fix

1. **First Time Signup:**

   - User enters email/password
   - Confirmation email sent
   - User needs to click link to confirm

2. **Duplicate Signup Attempt:**

   - User tries to sign up with same email
   - System detects existing user
   - Automatically resends confirmation email
   - User informed: "Confirmation email resent"

3. **Manual Resend:**
   - User can click "Resend confirmation" button
   - New confirmation email sent
   - Works multiple times

### Code Changes Made

#### store.ts

- Added `resendConfirmation` function
- Improved `signUpWithEmail` to handle existing users
- Better error handling and user feedback

#### EmailAuth.tsx

- Added resend confirmation button (shows only in signup mode)
- Added `handleResendConfirmation` callback
- Improved user experience

### Environment Variables Required

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Production Recommendations

1. **Custom SMTP**: Set up custom SMTP in Supabase for better email deliverability
2. **Rate Limiting**: Consider implementing rate limiting for resend requests
3. **Email Validation**: Add email domain validation if needed
4. **Analytics**: Track signup conversion rates and email delivery
