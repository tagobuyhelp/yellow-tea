#!/bin/bash

# Yellow Tea Site - Deployment Script
# Run this after VPS setup

echo "🚀 Deploying Yellow Tea site..."

# Set variables
APP_DIR="/var/www/yellow-tea"
REPO_URL="https://github.com/yourusername/yellow-tea-site.git"  # Update this
DOMAIN="yellowtea.in"  # Update this

# Navigate to app directory
cd $APP_DIR

# Clone repository (if not exists)
if [ ! -d ".git" ]; then
    echo "📥 Cloning repository..."
    git clone $REPO_URL .
fi

# Pull latest changes
echo "📥 Pulling latest changes..."
git pull origin main

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Create PM2 ecosystem file
echo "⚙️ Creating PM2 configuration..."
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'yellow-tea',
    script: 'server.js',
    cwd: '$APP_DIR',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/pm2/yellow-tea-error.log',
    out_file: '/var/log/pm2/yellow-tea-out.log',
    log_file: '/var/log/pm2/yellow-tea-combined.log',
    time: true
  }]
}
EOF

# Create PM2 logs directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start/restart application with PM2
echo "🚀 Starting application with PM2..."
pm2 delete yellow-tea 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Deployment complete!"
echo "🌐 Application running on port 3000"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs yellow-tea" 