# Email Confirmation Production Deployment Guide

## Problem Solved

✅ Email confirmation links now use configurable URLs instead of hardcoded localhost
✅ Proper environment variable configuration for both development and production
✅ Comprehensive documentation for deployment setup

## Key Changes Made

### 1. Environment Variable Configuration

- Added `VITE_APP_URL` environment variable for configurable app URL
- Updated `signUpWithEmail()` and `resendConfirmation()` functions to use configurable URL
- Created `.env.example` and `.env.local.example` template files

### 2. Enhanced Email Authentication

```typescript
// Before: Hardcoded localhost
emailRedirectTo: `${window.location.origin}/auth/callback`;

// After: Configurable URL with fallback
const appUrl = import.meta.env.VITE_APP_URL || window.location.origin;
emailRedirectTo: `${appUrl}/auth/callback`;
```

### 3. Deployment Documentation

- Updated `DEPLOYMENT.md` with environment configuration steps
- Added Supabase dashboard configuration requirements
- Created multiple deployment options with proper environment handling

## Environment Setup

### Development (.env.local)

```bash
VITE_APP_URL=http://localhost:5174
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

### Production (.env.production)

```bash
VITE_APP_URL=https://yourdomain.com
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_GEMINI_API_KEY=your_gemini_key
```

## Supabase Dashboard Configuration

### 1. Authentication > URL Configuration

- **Site URL**: `https://yourdomain.com`
- **Redirect URLs**:
  - `https://yourdomain.com/auth/callback` (production)
  - `http://localhost:5174/auth/callback` (development)

### 2. Authentication > Settings

- ✅ Enable email confirmations
- Set confirmation URL template to use the redirect URLs above

## Deployment Steps

### Quick Deploy

1. Set environment variables on your hosting platform
2. Ensure `VITE_APP_URL` matches your production domain
3. Configure Supabase redirect URLs in dashboard
4. Deploy the application

### Example for Vercel

```bash
# Set environment variables
vercel env add VITE_APP_URL https://your-vercel-app.vercel.app
vercel env add VITE_SUPABASE_URL your_supabase_url
vercel env add VITE_SUPABASE_ANON_KEY your_supabase_key
vercel env add VITE_GEMINI_API_KEY your_gemini_key

# Deploy
vercel --prod
```

### Example for Railway/Render

Add these environment variables in your platform's dashboard:

- `VITE_APP_URL`: Your app's production URL
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `VITE_GEMINI_API_KEY`: Your Gemini API key

## Testing Checklist

### Before Deployment

- [ ] Environment variables configured correctly
- [ ] Supabase redirect URLs updated in dashboard
- [ ] Local build successful: `npm run build`
- [ ] Email confirmations work in development

### After Deployment

- [ ] Sign up with new email receives confirmation email
- [ ] Confirmation email links redirect to production domain
- [ ] Resend confirmation functionality works
- [ ] Password reset emails work (if implemented)

## Troubleshooting

### Email Links Still Use Localhost

- Check `VITE_APP_URL` environment variable is set correctly
- Verify Supabase redirect URLs include production domain
- Clear browser cache and test with new email

### Confirmation Emails Not Received

- Check Supabase email settings and templates
- Verify email confirmations are enabled
- Consider setting up custom SMTP for production

### Build Errors

- Ensure all environment variables are present
- Check TypeScript errors: `npm run typecheck`
- Verify all imports and dependencies are correct

## Next Steps

1. Deploy to your hosting platform with proper environment variables
2. Test email confirmation flow end-to-end
3. Monitor email delivery and user signup success rates
4. Consider implementing custom SMTP for better email reliability
