# Google Authentication Setup

## Prerequisites
To enable Google Sign-In, you need to configure Google OAuth in your Supabase project and Google Cloud Console.

## Step 1: Set up Google OAuth in Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Select "Web application"
   - Add authorized redirect URIs:
     - `https://[YOUR_SUPABASE_PROJECT_ID].supabase.co/auth/v1/callback`
     - For local development: `http://localhost:5173` and `http://localhost:5174`
   - Copy the Client ID and Client Secret

## Step 2: Configure Google Auth in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to Authentication > Providers
4. Find Google in the list and enable it
5. Enter your Google OAuth credentials:
   - Client ID (from Google Cloud Console)
   - Client Secret (from Google Cloud Console)
6. **IMPORTANT**: Note the callback URL shown in Supabase (usually in the format):
   - `https://[YOUR_PROJECT_ID].supabase.co/auth/v1/callback`
7. Save the configuration

## Step 3: Finding Your Supabase Callback URL

1. In Supabase Dashboard, go to Authentication > Providers
2. Click on Google provider
3. You'll see the callback URL displayed - it looks like:
   - `https://xyzabc.supabase.co/auth/v1/callback`
4. Copy this exact URL and add it to Google Cloud Console

## Step 4: Add the Callback URL to Google Cloud Console

1. Go back to Google Cloud Console
2. Navigate to your OAuth 2.0 Client ID
3. Add the Supabase callback URL to "Authorized redirect URIs"
4. Also add these for local development:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5173/callback`
   - `http://localhost:5174/callback`
5. Save the changes

## Using Google Sign-In

The Auth component now includes a "Continue with Google" button that:
1. Redirects users to Google's OAuth consent screen
2. After authorization, redirects back to your app
3. Automatically creates a user session in Supabase
4. No email confirmation required

## Benefits of Google Sign-In

- **Faster onboarding**: No need to create and remember passwords
- **No email confirmation**: Users can start immediately
- **Better security**: Leverages Google's secure authentication
- **Familiar experience**: Most users already have Google accounts

## Testing

1. Click "Continue with Google" on the sign-in page
2. Select your Google account
3. Grant permissions (first time only)
4. You'll be redirected back and automatically signed in

## Troubleshooting

If Google Sign-In isn't working:
1. Check that Google provider is enabled in Supabase
2. Verify OAuth credentials are correctly entered
3. Ensure redirect URLs match your app URL
4. Check browser console for error messages
5. Verify Google+ API is enabled in Google Cloud Console