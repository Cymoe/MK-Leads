# Google OAuth Setup for ReactLeads

## Fix for "Connection has timed out" error

### 1. Check Supabase Dashboard
1. Go to your Supabase project: https://app.supabase.com/project/dicscsehiegqsmtwewis
2. Navigate to Authentication → Providers
3. Click on Google provider
4. Ensure it's enabled
5. Copy the "Callback URL" shown (should be: `https://dicscsehiegqsmtwewis.supabase.co/auth/v1/callback`)

### 2. Update Google Cloud Console
1. Go to https://console.cloud.google.com
2. Select your project
3. Navigate to APIs & Services → Credentials
4. Click on your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add:
   - `https://dicscsehiegqsmtwewis.supabase.co/auth/v1/callback`
6. Under "Authorized JavaScript origins", add:
   - `http://localhost:5173`
   - `http://localhost:5173/`
   - `https://dicscsehiegqsmtwewis.supabase.co`
7. Click "SAVE"

### 3. Wait for propagation
Google OAuth changes can take 5-10 minutes to propagate. After making the changes above, wait a few minutes before testing again.

### 4. Alternative: Use Email Authentication
If Google OAuth continues to fail, you can use the "Use Email Instead" button on the login page as a temporary workaround.

### 5. Check Browser Console
Open browser developer tools (F12) and check the Console tab for any specific error messages when clicking "Continue with Google".

### 6. Clear Browser Cache
Sometimes OAuth issues are caused by cached redirects:
1. Clear your browser cache and cookies for localhost:5173
2. Try an incognito/private window
3. Try a different browser

### 7. Verify Environment Variables
Make sure your `.env` file has the correct Supabase URL and anon key:
```
VITE_SUPABASE_URL=https://dicscsehiegqsmtwewis.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw
```