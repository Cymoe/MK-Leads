#!/bin/bash

# Setup script for ReactLeads environment variables

echo "🚀 Setting up ReactLeads environment variables..."

# Create .env.local file
cat > .env.local << EOF
# Local Development Environment Variables
# This file is for local development only - DO NOT commit to git

# Supabase Configuration
VITE_SUPABASE_URL=https://dicscsehiegqsmtwewis.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpY3Njc2VoaWVncXNtdHdld2lzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1MDg3MTcsImV4cCI6MjA2OTA4NDcxN30.oiSgY_LsqweXzYbThLly6FQueQEqdHhAWxG7gn3s8Sw

# App URLs for authentication redirects
VITE_PRODUCTION_URL=https://mk-leads.vercel.app
EOF

# Add .env.local to .gitignore if not already there
if ! grep -q ".env.local" .gitignore 2>/dev/null; then
    echo ".env.local" >> .gitignore
    echo "✅ Added .env.local to .gitignore"
fi

echo "✅ Created .env.local file"
echo "✅ Environment setup complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start local development"
echo "2. For production deployment, check DEPLOYMENT_SETUP.md"
echo "3. Make sure to set environment variables in Vercel Dashboard"
