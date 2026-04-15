#!/bin/bash

# Yellow Tea Site - VPS Setup Script
# Run this on your Linux VPS

echo "🚀 Setting up Yellow Tea site on VPS..."

# Update system
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
echo "📦 Installing Node.js 20.x..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
echo "📦 Installing PM2..."
sudo npm install -g pm2

# Install Nginx
echo "📦 Installing Nginx..."
sudo apt install nginx -y

# Install Git
echo "📦 Installing Git..."
sudo apt install git -y

# Create application directory
echo "📁 Creating application directory..."
sudo mkdir -p /var/www/yellow-tea
sudo chown $USER:$USER /var/www/yellow-tea

# Install UFW firewall
echo "🔥 Setting up firewall..."
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo "✅ VPS setup complete!"
echo "🌐 Next steps:"
echo "   1. Clone your repository"
echo "   2. Install dependencies"
echo "   3. Build the application"
echo "   4. Configure Nginx"
echo "   5. Start the application" 