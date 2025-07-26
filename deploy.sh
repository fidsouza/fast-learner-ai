#!/bin/bash

# 🚀 Fast Learner AI - Deploy Script
# This script helps deploy both frontend and backend

set -e  # Exit on any error

echo "🚀 Fast Learner AI Deploy Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ] && [ ! -d "frontend" ] && [ ! -d "backend" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo "🔍 Checking prerequisites..."

# Check for required tools
if ! command_exists npm; then
    echo "❌ npm is required but not installed"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Deploy Backend
echo "🔧 Backend Deploy Options:"
echo "1. Railway (Recommended)"
echo "2. Heroku"
echo "3. Skip backend deploy"
echo ""
read -p "Choose option (1-3): " backend_choice

case $backend_choice in
    1)
        echo "🚂 Deploying to Railway..."
        if ! command_exists railway; then
            echo "📦 Installing Railway CLI..."
            npm install -g @railway/cli
        fi
        
        cd backend
        echo "🔑 Please ensure your environment variables are set in Railway dashboard"
        echo "📋 Required variables: NODE_ENV, PORT, SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_KEY"
        read -p "Press Enter when ready to deploy..."
        
        railway up
        cd ..
        echo "✅ Backend deployed to Railway"
        ;;
    2)
        echo "🟪 Deploying to Heroku..."
        if ! command_exists heroku; then
            echo "❌ Please install Heroku CLI first: https://devcenter.heroku.com/articles/heroku-cli"
            exit 1
        fi
        
        cd backend
        echo "🔑 Setting environment variables..."
        read -p "Enter your Heroku app name: " heroku_app
        read -p "Enter your Supabase URL: " supabase_url
        read -p "Enter your Supabase Anon Key: " supabase_anon
        read -p "Enter your Supabase Service Key: " supabase_service
        
        heroku config:set NODE_ENV=production --app $heroku_app
        heroku config:set PORT=3001 --app $heroku_app
        heroku config:set SUPABASE_URL=$supabase_url --app $heroku_app
        heroku config:set SUPABASE_ANON_KEY=$supabase_anon --app $heroku_app
        heroku config:set SUPABASE_SERVICE_KEY=$supabase_service --app $heroku_app
        
        git push heroku main
        cd ..
        echo "✅ Backend deployed to Heroku"
        ;;
    3)
        echo "⏭️ Skipping backend deploy"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""

# Deploy Frontend
echo "🎨 Frontend Deploy Options:"
echo "1. Vercel (Recommended)"
echo "2. Netlify"
echo "3. Skip frontend deploy"
echo ""
read -p "Choose option (1-3): " frontend_choice

case $frontend_choice in
    1)
        echo "▲ Deploying to Vercel..."
        if ! command_exists vercel; then
            echo "📦 Installing Vercel CLI..."
            npm install -g vercel
        fi
        
        cd frontend
        echo "🔑 Please ensure your .env.production file is configured"
        echo "📋 Required variables: REACT_APP_API_URL, REACT_APP_SUPABASE_URL, REACT_APP_SUPABASE_ANON_KEY"
        
        if [ ! -f ".env.production" ]; then
            echo "⚠️ .env.production not found. Creating from example..."
            cp .env.production.example .env.production
            echo "📝 Please edit .env.production with your actual values"
            read -p "Press Enter when ready to continue..."
        fi
        
        vercel --prod
        cd ..
        echo "✅ Frontend deployed to Vercel"
        ;;
    2)
        echo "🌐 Deploying to Netlify..."
        if ! command_exists netlify; then
            echo "📦 Installing Netlify CLI..."
            npm install -g netlify-cli
        fi
        
        cd frontend
        echo "🔧 Building application..."
        npm run build
        
        echo "🚀 Deploying to Netlify..."
        netlify deploy --prod --dir=build
        cd ..
        echo "✅ Frontend deployed to Netlify"
        ;;
    3)
        echo "⏭️ Skipping frontend deploy"
        ;;
    *)
        echo "❌ Invalid option"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deploy Complete!"
echo "===================="
echo ""
echo "📋 Next Steps:"
echo "1. Test your deployed application"
echo "2. Configure custom domain (optional)"
echo "3. Set up monitoring and alerts"
echo "4. Update CORS settings if needed"
echo ""
echo "🔗 Useful Links:"
echo "- Supabase Dashboard: https://app.supabase.com"
echo "- Railway Dashboard: https://railway.app"
echo "- Vercel Dashboard: https://vercel.com/dashboard"
echo ""
echo "📚 For detailed instructions, see DEPLOY_GUIDE.md"