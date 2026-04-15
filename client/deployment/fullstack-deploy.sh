#!/bin/bash

# Yellow Tea Full-Stack Deployment Script
# Deploys both frontend and backend

echo "🚀 Deploying Yellow Tea Full-Stack Application..."

# Set variables
FRONTEND_DIR="/var/www/yellow-tea-frontend"
BACKEND_DIR="/var/www/yellow-tea-backend"
DOMAIN="yellowtea.in"

# Create directories
sudo mkdir -p $FRONTEND_DIR $BACKEND_DIR
sudo chown $USER:$USER $FRONTEND_DIR $BACKEND_DIR

# Deploy Frontend
echo "📱 Deploying Frontend..."
cd $FRONTEND_DIR

# Clone frontend repository
if [ ! -d ".git" ]; then
    echo "📥 Cloning frontend repository..."
    git clone https://github.com/yourusername/yellow-tea-site.git .
fi

# Pull latest changes
git pull origin main

# Install dependencies and build
npm install
npm run build

# Deploy Backend
echo "🔧 Deploying Backend..."
cd $BACKEND_DIR

# Clone backend repository
if [ ! -d ".git" ]; then
    echo "📥 Cloning backend repository..."
    git clone https://github.com/tagobuyhelp/YellowTeaBackend.git .
fi

# Pull latest changes
git pull origin main

# Install dependencies
npm install

# Create PM2 ecosystem file for full-stack
echo "⚙️ Creating PM2 configuration for full-stack..."
cat > $FRONTEND_DIR/ecosystem.config.js << EOF
module.exports = {
  apps: [
    {
      name: 'yellow-tea-frontend',
      script: 'server.js',
      cwd: '$FRONTEND_DIR',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        API_URL: 'http://localhost:5000'
      },
      error_file: '/var/log/pm2/yellow-tea-frontend-error.log',
      out_file: '/var/log/pm2/yellow-tea-frontend-out.log',
      log_file: '/var/log/pm2/yellow-tea-frontend-combined.log',
      time: true
    },
    {
      name: 'yellow-tea-backend',
      script: 'src/index.js',
      cwd: '$BACKEND_DIR',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        JWT_SECRET: 'your_super_secure_jwt_secret_here',
        DATABASE_URL: 'your_database_connection_string'
      },
      error_file: '/var/log/pm2/yellow-tea-backend-error.log',
      out_file: '/var/log/pm2/yellow-tea-backend-out.log',
      log_file: '/var/log/pm2/yellow-tea-backend-combined.log',
      time: true
    }
  ]
}
EOF

# Create logs directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start applications with PM2
echo "🚀 Starting applications with PM2..."
cd $FRONTEND_DIR
pm2 delete yellow-tea-frontend yellow-tea-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup

echo "✅ Full-stack deployment complete!"
echo "🌐 Frontend running on port 3000"
echo "🔧 Backend running on port 5000"
echo "📊 Check status: pm2 status"
echo "📋 View logs: pm2 logs" 