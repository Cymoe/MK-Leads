# Quick Google Auth Setup Guide

## The Callback URL Issue

From your screenshot, it looks like you need the correct callback URL for Supabase. Here's what you need:

### 1. Find Your Supabase Project URL
- Go to Supabase Dashboard → Settings → API
- Look for your project URL (e.g., `https://xyzabc.supabase.co`)

### 2. The Callback URL Format
Your callback URL will be:
```
https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback
```

### 3. Where to Add This URL
In Google Cloud Console, add these URLs to "Authorized redirect URIs":

1. **Production callback** (from Supabase):
   - `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`

2. **Local development URLs**:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:3000` (if using that port)

### 4. Common Mistakes to Avoid
- ❌ Don't use `http://localhost:5173/callback` - Supabase handles the callback internally
- ❌ Don't forget to save changes in Google Cloud Console
- ❌ Don't mix up Client ID and Client Secret

### 5. Quick Test
After setup:
1. Click "Continue with Google" in your app
2. You should be redirected to Google
3. After authorization, you'll come back to your app automatically

If you get a redirect error, double-check that the callback URL in Google Console matches exactly what Supabase shows in the Authentication > Providers > Google section.