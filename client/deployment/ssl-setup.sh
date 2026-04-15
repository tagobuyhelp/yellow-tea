#!/bin/bash

# Yellow Tea Site - SSL Setup Script
# Run this after Nginx configuration

echo "🔒 Setting up SSL/HTTPS..."

# Install Certbot
echo "📦 Installing Certbot..."
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
echo "🔐 Getting SSL certificate..."
sudo certbot --nginx -d yellowtea.in -d www.yellowtea.in

# Test SSL renewal
echo "🧪 Testing SSL renewal..."
sudo certbot renew --dry-run

# Setup automatic renewal
echo "⏰ Setting up automatic renewal..."
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -

echo "✅ SSL setup complete!"
echo "🔒 Your site is now accessible via HTTPS"
echo "🔄 SSL will auto-renew every 60 days" 