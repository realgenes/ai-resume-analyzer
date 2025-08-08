# 🚨 URGENT FIX: Email Verification Localhost Issue

## Problem

Email verification links are still pointing to `localhost:3000` instead of your Vercel production URL, causing "OTP expired" errors.

## Root Cause

The issue is likely one of these:

1. `VITE_APP_URL` environment variable not set correctly in Vercel
2. Supabase dashboard still configured with old URLs
3. Environment variable not being loaded properly

## ✅ IMMEDIATE STEPS TO FIX

### Step 1: Verify Vercel Environment Variables

1. **Go to Vercel Dashboard:**

   - Visit [vercel.com](https://vercel.com)
   - Select your project
   - Go to **Settings** → **Environment Variables**

2. **Check/Add VITE_APP_URL:**

   ```bash
   VITE_APP_URL=https://your-actual-vercel-url.vercel.app
   ```

   **⚠️ IMPORTANT:** Replace `your-actual-vercel-url.vercel.app` with your **EXACT** Vercel deployment URL

### Step 2: Find Your Exact Vercel URL

1. In Vercel dashboard, go to your project
2. Look at the **Domains** section
3. Copy the `.vercel.app` URL (it looks like: `https://projectname-hash.vercel.app`)
4. Use THIS exact URL for `VITE_APP_URL`

### Step 3: Update Supabase Configuration

1. **Go to Supabase Dashboard:**

   - Visit [supabase.com](https://supabase.com)
   - Select your project
   - Go to **Authentication** → **Settings**

2. **Update Site URL:**

   ```
   https://your-actual-vercel-url.vercel.app
   ```

3. **Update Redirect URLs:**
   Add both:
   ```
   https://your-actual-vercel-url.vercel.app/auth/callback
   http://localhost:5174/auth/callback
   ```

### Step 4: Force Redeploy

After updating environment variables:

1. Go to Vercel → **Deployments**
2. Click the **⋯** menu on the latest deployment
3. Click **Redeploy**
4. **OR** push a new commit to trigger deployment

## 🔍 DEBUGGING STEPS

### Check if Environment Variable is Working

Add this temporary debug code to see what URL is being used:

**In `app/lib/store.ts`** (add temporarily):

```typescript
// Add this at the top of any function to debug
console.log("🐛 DEBUG - VITE_APP_URL:", import.meta.env.VITE_APP_URL);
```

### Test the Fix

1. Open browser console on your production site
2. Try to sign up with a new email
3. Check console logs for the debug message
4. Check email for correct URL

## 📧 EMAIL TEMPLATE CHECK

If the above doesn't work, check Supabase email templates:

1. **Supabase Dashboard** → **Authentication** → **Email Templates**
2. **Edit "Confirm signup" template**
3. Ensure it uses: `{{ .ConfirmationURL }}`
4. **DO NOT** hardcode any URLs in the template

## 🛠️ ALTERNATIVE FIX (If Above Doesn't Work)

If environment variables aren't working, temporarily hardcode your Vercel URL:

**In `app/lib/store.ts`** (temporary fix):

```typescript
// Temporary hardcode fix
const getAppUrl = () => {
  // For production, return your actual Vercel URL
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost"
  ) {
    return "https://your-actual-vercel-url.vercel.app";
  }
  return import.meta.env.VITE_APP_URL || "http://localhost:5174";
};

// Then use getAppUrl() instead of import.meta.env.VITE_APP_URL
emailRedirectTo: `${getAppUrl()}/auth/callback`;
```

## ✅ VERIFICATION CHECKLIST

- [ ] `VITE_APP_URL` set correctly in Vercel
- [ ] Supabase Site URL updated
- [ ] Supabase Redirect URLs updated
- [ ] Redeployed after environment variable changes
- [ ] Tested with fresh email address
- [ ] Email contains correct production URL

## 🆘 STILL NOT WORKING?

If you're still getting localhost URLs:

1. **Clear Supabase Cache:**

   - In Supabase dashboard, restart your project
   - Or create a new test project temporarily

2. **Check Browser Network Tab:**

   - Open DevTools → Network
   - Try signup
   - Look for the auth request and check what URL is being sent

3. **Environment Variable Debug:**
   ```bash
   # Run this in your local terminal to verify the build
   npm run build
   # Check if the environment variable is being included in the build
   ```

Let me know the exact Vercel URL and I can help you set it up correctly!
