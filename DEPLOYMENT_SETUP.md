# Deployment Setup Guide

This guide explains how to set up your ReactLeads application for both local development and production deployment on Vercel.

## Environment Configuration

### Local Development

1. Create a `.env.local` file in your project root:
```bash
# Local Development Environment Variables
VITE_SUPABASE_URL=https://dicscsehiegqsmtwewis.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
VITE_PRODUCTION_URL=https://mk-leads.vercel.app
```

2. Add `.env.local` to your `.gitignore` file to keep secrets safe:
```bash
echo ".env.local" >> .gitignore
```

### Vercel Production Setup

1. **Deploy to Vercel:**
   ```bash
   npm i -g vercel
   vercel --prod
   ```

2. **Set Environment Variables in Vercel Dashboard:**
   - Go to your project settings in Vercel Dashboard
   - Navigate to "Environment Variables"
   - Add these variables:

   ```
   VITE_SUPABASE_URL = https://dicscsehiegqsmtwewis.supabase.co
   VITE_SUPABASE_ANON_KEY = your_supabase_anon_key_here
   VITE_PRODUCTION_URL = https://your-app-name.vercel.app
   ```

   **Important:** Make sure to set these for "Production" environment.

## Supabase Authentication Setup

### Update Redirect URLs in Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** → **URL Configuration**
4. Update the **Site URL** to your production URL: `https://mk-leads.vercel.app`
5. Add these **Redirect URLs**:
   ```
   http://localhost:5173
   http://localhost:5173/*
   http://localhost:5174
   http://localhost:5174/*
   https://mk-leads.vercel.app
   https://mk-leads.vercel.app/*
   ```

### Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to your OAuth 2.0 Client ID
3. Add these **Authorized redirect URIs**:
   ```
   https://dicscsehiegqsmtwewis.supabase.co/auth/v1/callback
   ```
4. Add these **Authorized JavaScript origins**:
   ```
   http://localhost:5173
   https://mk-leads.vercel.app
   ```

## How It Works

The application now uses environment-aware redirect URLs:

- **Development**: Always redirects to `http://localhost:5173`
- **Production**: Uses the `VITE_PRODUCTION_URL` environment variable or falls back to `window.location.origin`

This ensures that:
- Local development works correctly with localhost
- Production deployment redirects users back to your live site
- No hardcoded URLs that break in different environments

## Testing

### Local Testing
1. Run `npm run dev`
2. Test Google sign-in - should redirect back to localhost

### Production Testing
1. Deploy to Vercel
2. Test Google sign-in on your live site
3. Should redirect back to your production URL

## Troubleshooting

### Common Issues

1. **Still redirecting to localhost in production:**
   - Check that `VITE_PRODUCTION_URL` is set in Vercel environment variables
   - Redeploy after setting environment variables

2. **Google OAuth errors:**
   - Verify redirect URIs in Google Cloud Console match exactly
   - Check that Supabase callback URL is added to Google OAuth settings

3. **Supabase authentication errors:**
   - Ensure redirect URLs are added to Supabase dashboard
   - Check that Site URL matches your production domain

### Debug Information

The application logs the redirect URL to the console during sign-in. Check browser console to see which URL is being used for redirects.
