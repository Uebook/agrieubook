#!/bin/bash

# Script to set Vercel environment variables
# Run this from the admin directory

echo "🔧 Setting Vercel Environment Variables"
echo "========================================"
echo ""

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found!"
    echo ""
    echo "Please install it first:"
    echo "  npm install -g vercel"
    echo ""
    exit 1
fi

# Check if logged in
if ! vercel whoami &> /dev/null; then
    echo "⚠️  Not logged in to Vercel"
    echo "Please run: vercel login"
    exit 1
fi

echo "✅ Vercel CLI found and logged in"
echo ""

# Supabase keys (from VERCEL_DEPLOYMENT.md)
SUPABASE_URL="https://isndoxsyjbdzibhkrisj.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1ODg4NTEsImV4cCI6MjA4MzE2NDg1MX0.xAhUBZ-5NCySy6QmF0DheBZaeFZRBBtnHRDHYcpQglo"
SUPABASE_SERVICE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlzbmRveHN5amJkemliaGtyaXNqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NzU4ODg1MSwiZXhwIjoyMDgzMTY0ODUxfQ.QqqPY15EB75Dy2oDDKyzaDUMR5i9-wPbNDxa2rH-zqg"
APP_URL="https://admin-orcin-omega.vercel.app"

echo "Setting environment variables..."
echo ""

# Set environment variables for production
echo "1. Setting NEXT_PUBLIC_SUPABASE_URL..."
echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "2. Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "3. Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "4. Setting NEXT_PUBLIC_APP_URL..."
echo "$APP_URL" | vercel env add NEXT_PUBLIC_APP_URL production

echo ""
echo "✅ Environment variables set!"
echo ""
echo "📝 Next steps:"
echo "1. Redeploy your application: vercel --prod"
echo "2. Or trigger a redeploy from Vercel Dashboard"
echo ""
echo "🔍 To verify, check: https://vercel.com/dashboard"

