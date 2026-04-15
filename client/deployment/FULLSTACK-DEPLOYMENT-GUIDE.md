# 🚀 Full-Stack Yellow Tea Deployment Guide

## 📋 **Overview**

This guide deploys your complete Yellow Tea application with:
- **Frontend**: Vite/React with SEO injection
- **Backend**: Node.js/Express API
- **Database**: PostgreSQL/MongoDB/MySQL
- **Cache**: Redis (optional)
- **Web Server**: Nginx with SSL
- **Process Manager**: PM2

---

## **🏗️ Architecture**

```
Internet → Nginx → Frontend (Port 3000) → Backend (Port 5000) → Database
                ↓
            Static Files (CSS, JS, Images)
```

---

## **Step 1: VPS Initial Setup**

### **Connect to your VPS:**
```bash
ssh root@your-vps-ip
```

### **Run the complete setup:**
```bash
# Download and run setup script
curl -fsSL https://raw.githubusercontent.com/yourusername/yellow-tea-site/main/deployment/vps-setup.sh | bash

# Setup database
curl -fsSL https://raw.githubusercontent.com/yourusername/yellow-tea-site/main/deployment/database-setup.sh | bash
```

---

## **Step 2: Deploy Full-Stack Application**

### **Run the full-stack deployment:**
```bash
# Download and run full-stack deployment
curl -fsSL https://raw.githubusercontent.com/yourusername/yellow-tea-site/main/deployment/fullstack-deploy.sh | bash
```

### **Or deploy manually:**

#### **Deploy Frontend:**
```bash
cd /var/www/yellow-tea-frontend
git clone https://github.com/yourusername/yellow-tea-site.git .
npm install
npm run build
```

#### **Deploy Backend:**
```bash
cd /var/www/yellow-tea-backend
git clone https://github.com/tagobuyhelp/YellowTeaBackend.git .
npm install
```

---

## **Step 3: Environment Configuration**

### **Frontend Environment:**
```bash
cd /var/www/yellow-tea-frontend
cp deployment/fullstack.env .env
nano .env
```

**Frontend .env content:**
```env
NODE_ENV=production
PORT=3000
API_URL=https://yellowtea.in/api
VITE_API_URL=https://yellowtea.in/api
```

### **Backend Environment:**
```bash
cd /var/www/yellow-tea-backend
cp deployment/fullstack.env .env
nano .env
```

**Backend .env content:**
```env
NODE_ENV=production
PORT=5000
DOMAIN=yellowtea.in

# JWT Configuration
JWT_SECRET=your_generated_jwt_secret_here
JWT_EXPIRES_IN=7d

# Database Configuration
DATABASE_URL=postgresql://yellow_tea_user:password@localhost:5432/yellow_tea_db

# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15m
RATE_LIMIT_MAX=100
```

### **Generate Secure Secrets:**
```bash
# Generate JWT Secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate Database Password
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

---

## **Step 4: Configure Nginx**

### **Create Nginx configuration:**
```bash
sudo cp /var/www/yellow-tea-frontend/deployment/nginx-fullstack.conf /etc/nginx/sites-available/yellow-tea
sudo nano /etc/nginx/sites-available/yellow-tea
```

### **Enable the site:**
```bash
sudo ln -s /etc/nginx/sites-available/yellow-tea /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

---

## **Step 5: Start Applications**

### **Create PM2 ecosystem file:**
```bash
cd /var/www/yellow-tea-frontend
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: 'yellow-tea-frontend',
      script: 'server.js',
      cwd: '/var/www/yellow-tea-frontend',
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
      cwd: '/var/www/yellow-tea-backend',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      error_file: '/var/log/pm2/yellow-tea-backend-error.log',
      out_file: '/var/log/pm2/yellow-tea-backend-out.log',
      log_file: '/var/log/pm2/yellow-tea-backend-combined.log',
      time: true
    }
  ]
}
EOF
```

### **Start with PM2:**
```bash
pm2 delete yellow-tea-frontend yellow-tea-backend 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

---

## **Step 6: Setup SSL/HTTPS**

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

## **Step 7: Database Setup**

### **Run database migrations (if any):**
```bash
cd /var/www/yellow-tea-backend
npm run migrate  # or whatever migration command your backend uses
```

### **Seed database (if needed):**
```bash
npm run seed  # or whatever seed command your backend uses
```

---

## **Step 8: Testing & Monitoring**

### **Check application status:**
```bash
pm2 status
pm2 logs
```

### **Test endpoints:**
```bash
# Frontend health check
curl http://localhost:3000/health

# Backend health check
curl http://localhost:5000/health

# API endpoint test
curl http://localhost:5000/api/products

# Full domain test
curl https://yellowtea.in/health
curl https://yellowtea.in/api/health
```

### **Monitor logs:**
```bash
# Frontend logs
pm2 logs yellow-tea-frontend --lines 50

# Backend logs
pm2 logs yellow-tea-backend --lines 50

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

---

## **Step 9: Maintenance & Updates**

### **Update frontend:**
```bash
cd /var/www/yellow-tea-frontend
git pull origin main
npm install
npm run build
pm2 restart yellow-tea-frontend
```

### **Update backend:**
```bash
cd /var/www/yellow-tea-backend
git pull origin main
npm install
pm2 restart yellow-tea-backend
```

### **Update both:**
```bash
# Update frontend
cd /var/www/yellow-tea-frontend
git pull origin main
npm install
npm run build

# Update backend
cd /var/www/yellow-tea-backend
git pull origin main
npm install

# Restart both
pm2 restart all
```

---

## **🔧 Troubleshooting**

### **Application Issues:**
```bash
# Check PM2 status
pm2 status

# View logs
pm2 logs yellow-tea-frontend
pm2 logs yellow-tea-backend

# Restart applications
pm2 restart yellow-tea-frontend
pm2 restart yellow-tea-backend
```

### **Database Issues:**
```bash
# PostgreSQL
sudo systemctl status postgresql
sudo -u postgres psql -d yellow_tea_db

# MongoDB
sudo systemctl status mongod
mongosh yellow_tea_db

# MySQL
sudo systemctl status mysql
sudo mysql -u yellow_tea_user -p yellow_tea_db
```

### **Nginx Issues:**
```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx
```

### **SSL Issues:**
```bash
sudo certbot certificates
sudo certbot renew --dry-run
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

### **Database optimization:**
```bash
# PostgreSQL
sudo -u postgres psql -d yellow_tea_db -c "VACUUM ANALYZE;"

# MongoDB
mongosh yellow_tea_db --eval "db.runCommand({compact: 'collection_name'})"
```

---

## **🔒 Security Checklist**

- ✅ **Firewall enabled** (UFW)
- ✅ **SSL/HTTPS configured**
- ✅ **Security headers set**
- ✅ **Database secured**
- ✅ **JWT secrets generated**
- ✅ **Rate limiting enabled**
- ✅ **CORS configured**
- ✅ **File upload restrictions**

---

## **🎉 Success!**

Your full-stack Yellow Tea application is now live with:

- ✅ **Frontend**: React with SEO injection
- ✅ **Backend**: Node.js API
- ✅ **Database**: PostgreSQL/MongoDB/MySQL
- ✅ **Cache**: Redis (optional)
- ✅ **Web Server**: Nginx with SSL
- ✅ **Process Manager**: PM2
- ✅ **Monitoring**: Logs and health checks
- ✅ **Security**: Firewall, SSL, headers

**Visit https://yellowtea.in to see your full-stack application live!** 🚀✨

---

## **📞 Support**

If you encounter issues:

1. **Check logs**: `pm2 logs` and `sudo journalctl`
2. **Verify services**: `sudo systemctl status`
3. **Test connectivity**: `curl` commands
4. **Review configuration**: Check .env files and nginx config

**Your Yellow Tea application is now production-ready!** 🌟 