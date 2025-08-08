# Vercel Deployment Guide - Fixing Localhost Links

## Issue Fixed

The application was sending verification emails with localhost links instead of the production Vercel URL. This has been fixed by replacing all hardcoded URLs with environment variables.

## Required Environment Variables

### In Vercel Dashboard:

1. Go to your project on Vercel
2. Navigate to **Settings** → **Environment Variables**
3. Add/Update the following variables:

| Variable Name            | Value                                 | Description                    |
| ------------------------ | ------------------------------------- | ------------------------------ |
| `VITE_SUPABASE_URL`      | `https://your-project-id.supabase.co` | Your Supabase project URL      |
| `VITE_SUPABASE_ANON_KEY` | `your_anon_key_here`                  | Your Supabase anonymous key    |
| `VITE_GEMINI_API_KEY`    | `your_gemini_key_here`                | Your Google Gemini API key     |
| `VITE_APP_URL`           | `https://your-vercel-app.vercel.app`  | **YOUR VERCEL DEPLOYMENT URL** |

### ⚠️ Critical: VITE_APP_URL Configuration

**For Production (Vercel):**

```
VITE_APP_URL=https://your-vercel-app.vercel.app
```

**For Development (Local):**

```
VITE_APP_URL=http://localhost:5174
```

## Files Modified

### 1. `/app/lib/store.ts`

- ✅ Fixed `signIn()` OAuth redirect URL
- ✅ Fixed `signUpWithEmail()` email redirect URL
- ✅ Fixed `resetPassword()` redirect URL
- ✅ Fixed `resendConfirmation()` email redirect URL

### 2. `/app/components/MultiAuth.tsx`

- ✅ Fixed OAuth providers redirect URL

### 3. `.env.example`

- ✅ Updated with better documentation for production setup

## Supabase Configuration Required

### 1. Authentication → URL Configuration

In your Supabase dashboard:

**Site URL:**

```
https://your-vercel-app.vercel.app
```

**Redirect URLs:**

```
https://your-vercel-app.vercel.app/auth/callback
http://localhost:5174/auth/callback
```

### 2. Authentication → Email Templates

Ensure the confirmation email template uses the correct redirect URL pattern. Supabase will automatically use the `emailRedirectTo` parameter we're now passing from the environment variable.

## Deployment Steps

1. **Update Environment Variables in Vercel:**

   - Set `VITE_APP_URL` to your actual Vercel deployment URL
   - Ensure all other environment variables are correctly set

2. **Update Supabase Dashboard:**

   - Set Site URL to your Vercel deployment URL
   - Add your Vercel URL to Redirect URLs list

3. **Deploy to Vercel:**

   ```bash
   git add .
   git commit -m "Fix email verification URLs"
   git push origin main
   ```

4. **Test the Fix:**
   - Try signing up with a new email
   - Check that the verification email contains your Vercel URL, not localhost
   - Verify that clicking the link redirects to your production app

## Verification Checklist

- [ ] `VITE_APP_URL` is set to production URL in Vercel
- [ ] Supabase Site URL matches your Vercel URL
- [ ] Supabase Redirect URLs include your Vercel URL
- [ ] Application builds successfully
- [ ] Email verification links point to production URL
- [ ] OAuth redirects work correctly

## Troubleshooting

### If emails still contain localhost:

1. Double-check `VITE_APP_URL` in Vercel environment variables
2. Ensure you've redeployed after setting the environment variable
3. Clear browser cache and test with a new email address

### If OAuth doesn't work:

1. Verify OAuth provider settings in Supabase
2. Check that redirect URLs match in both Supabase and OAuth provider settings
3. Ensure `VITE_APP_URL` is correctly set

## Development vs Production

The application now automatically uses the correct URL based on the environment:

- **Development:** Uses `VITE_APP_URL=http://localhost:5174`
- **Production:** Uses `VITE_APP_URL=https://your-vercel-app.vercel.app`

This ensures email links always point to the correct environment.
