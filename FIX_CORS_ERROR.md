# Fixing CORS Authentication Error

## Problem
You're seeing this error:
```
Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://dicscsehiegqsmtwewis.supabase.co/auth/v1/user
```

## Solution Steps

### 1. Check Your Development URL
Make sure you're accessing the app using the correct URL:
- ✅ Use: `http://localhost:5173`
- ❌ Avoid: `http://127.0.0.1:5173`

### 2. Update Supabase URL Configuration

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project (dicscsehiegqsmtwewis)
3. Navigate to **Authentication** → **URL Configuration**
4. Add these URLs to the **Redirect URLs** list:
   ```
   http://localhost:5173
   http://localhost:5173/*
   http://localhost:5174
   http://localhost:5174/*
   ```
5. Also add them to **Site URL** if needed

### 3. Check Your Environment Variables

Ensure your `.env` file has the correct values:
```env
VITE_SUPABASE_URL=https://dicscsehiegqsmtwewis.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw
```

### 4. Restart Your Development Server

After making changes:
1. Stop the dev server (Ctrl+C)
2. Run `npm run dev` again
3. Access via `http://localhost:5173`

### 5. Clear Browser Data

If still having issues:
1. Open Chrome DevTools (F12)
2. Right-click the Refresh button
3. Select "Empty Cache and Hard Reload"
4. Or try in an Incognito window

### 6. Additional Troubleshooting

If the error persists:

1. **Check Supabase Service Status**: Visit [status.supabase.com](https://status.supabase.com)

2. **Verify RLS Policies**: Make sure Row Level Security isn't blocking access:
   ```sql
   -- In Supabase SQL Editor
   SELECT * FROM auth.users WHERE id = auth.uid();
   ```

3. **Test Authentication**:
   - Sign out completely
   - Clear all site data for localhost
   - Sign in again with Google

### 7. Alternative: Disable RLS Temporarily (Development Only)

If you need to test imports urgently:
```sql
-- WARNING: Only for development!
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;
```

Remember to re-enable it:
```sql
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
```

## Still Having Issues?

The authentication system is working (you can sign in), but the CORS error suggests a configuration mismatch between your local development URL and what's configured in Supabase.

Double-check that you're using the exact same URL in:
- Your browser address bar
- Supabase URL Configuration
- Any proxy or firewall settings