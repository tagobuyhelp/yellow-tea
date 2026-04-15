# 🚀 Linux VPS Deployment Guide - Yellow Tea Site

## 📋 **Prerequisites**

- **Linux VPS** (Ubuntu 20.04+ recommended)
- **SSH access** to your VPS
- **Domain name** (optional but recommended)
- **Git repository** with your code

---

## **Step 1: VPS Initial Setup**

### **Connect to your VPS:**
```bash
ssh root@your-vps-ip
```

### **Run the setup script:**
```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/yellow-tea-site/main/deployment/vps-setup.sh | bash
```

### **Or run manually:**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2, Nginx, Git
sudo npm install -g pm2
sudo apt install nginx git -y

# Create app directory
sudo mkdir -p /var/www/yellow-tea
sudo chown $USER:$USER /var/www/yellow-tea

# Setup firewall
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw --force enable
```

---

## **Step 2: Deploy Application**

### **Clone and deploy:**
```bash
cd /var/www/yellow-tea

# Clone your repository
git clone https://github.com/yourusername/yellow-tea-site.git .

# Install dependencies
npm install

# Build the application
npm run build

# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'yellow-tea',
    script: 'server.js',
    cwd: '/var/www/yellow-tea',
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

# Create logs directory
sudo mkdir -p /var/log/pm2
sudo chown $USER:$USER /var/log/pm2

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## **Step 3: Configure Nginx**

### **Create Nginx configuration:**
```bash
sudo nano /etc/nginx/sites-available/yellow-tea
```

### **Add this configuration:**
```nginx
server {
    listen 80;
    server_name yellowtea.in www.yellowtea.in;  # Update with your domain
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/javascript;
    
    # Root directory
    root /var/www/yellow-tea/dist;
    index index.html;
    
    # Handle static files
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
    
    # Handle uploads directory
    location /uploads/ {
        alias /var/www/yellow-tea/public/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
    
    # Health check
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
```

### **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/yellow-tea /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

---

## **Step 4: Setup SSL/HTTPS (Optional but Recommended)**

### **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

### **Get SSL certificate:**
```bash
sudo certbot --nginx -d yellowtea.in -d www.yellowtea.in
```

### **Setup auto-renewal:**
```bash
sudo crontab -l 2>/dev/null | { cat; echo "0 12 * * * /usr/bin/certbot renew --quiet"; } | sudo crontab -
```

---

## **Step 5: Environment Configuration**

### **Create production environment file:**
```bash
cd /var/www/yellow-tea
cp deployment/production.env .env
nano .env  # Edit with your values
```

### **Generate secure JWT secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## **Step 6: Testing & Monitoring**

### **Check application status:**
```bash
pm2 status
pm2 logs yellow-tea
```

### **Test the site:**
```bash
curl http://localhost:3000/health
curl http://yellowtea.in/health
```

### **Monitor logs:**
```bash
# Application logs
pm2 logs yellow-tea --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## **Step 7: Maintenance & Updates**

### **Update application:**
```bash
cd /var/www/yellow-tea
git pull origin main
npm install
npm run build
pm2 restart yellow-tea
```

### **Update system:**
```bash
sudo apt update && sudo apt upgrade -y
sudo systemctl restart nginx
```

### **Backup:**
```bash
# Backup application
tar -czf yellow-tea-backup-$(date +%Y%m%d).tar.gz /var/www/yellow-tea

# Backup logs
sudo tar -czf logs-backup-$(date +%Y%m%d).tar.gz /var/log/pm2 /var/log/nginx
```

---

## **🔧 Troubleshooting**

### **Application not starting:**
```bash
pm2 logs yellow-tea
pm2 restart yellow-tea
```

### **Nginx issues:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx
```

### **SSL issues:**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
```

### **Port conflicts:**
```bash
sudo netstat -tlnp | grep :3000
sudo lsof -i :3000
```

---

## **📊 Performance Optimization**

### **Enable Nginx caching:**
```nginx
# Add to nginx config
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### **Enable PM2 clustering:**
```bash
pm2 start ecosystem.config.js --instances max
```

### **Monitor resources:**
```bash
htop
pm2 monit
```

---

## **🎉 Success!**

Your Yellow Tea site is now live on your Linux VPS with:

- ✅ **Production-ready Node.js server**
- ✅ **Nginx reverse proxy**
- ✅ **SSL/HTTPS encryption**
- ✅ **PM2 process management**
- ✅ **Automatic restarts**
- ✅ **Log management**
- ✅ **Security headers**
- ✅ **Gzip compression**
- ✅ **Static file caching**

**Visit your domain to see your site live!** 🚀✨ 