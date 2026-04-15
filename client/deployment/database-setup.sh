#!/bin/bash

# Yellow Tea - Database Setup Script
# Choose your preferred database

echo "🗄️ Setting up database for Yellow Tea..."

# Function to setup PostgreSQL
setup_postgresql() {
    echo "📦 Installing PostgreSQL..."
    sudo apt update
    sudo apt install postgresql postgresql-contrib -y
    
    # Start PostgreSQL service
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
    
    # Create database and user
    sudo -u postgres psql << EOF
CREATE DATABASE yellow_tea_db;
CREATE USER yellow_tea_user WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE yellow_tea_db TO yellow_tea_user;
ALTER USER yellow_tea_user CREATEDB;
\q
EOF
    
    echo "✅ PostgreSQL setup complete!"
    echo "📊 Database: yellow_tea_db"
    echo "👤 User: yellow_tea_user"
    echo "🔗 Connection: postgresql://yellow_tea_user:your_secure_password_here@localhost:5432/yellow_tea_db"
}

# Function to setup MongoDB
setup_mongodb() {
    echo "📦 Installing MongoDB..."
    
    # Import MongoDB public GPG key
    wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -
    
    # Add MongoDB repository
    echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    
    # Install MongoDB
    sudo apt update
    sudo apt install -y mongodb-org
    
    # Start MongoDB service
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Create database and user
    mongosh << EOF
use yellow_tea_db
db.createUser({
  user: "yellow_tea_user",
  pwd: "your_secure_password_here",
  roles: [
    { role: "readWrite", db: "yellow_tea_db" },
    { role: "dbAdmin", db: "yellow_tea_db" }
  ]
})
EOF
    
    echo "✅ MongoDB setup complete!"
    echo "📊 Database: yellow_tea_db"
    echo "👤 User: yellow_tea_user"
    echo "🔗 Connection: mongodb://yellow_tea_user:your_secure_password_here@localhost:27017/yellow_tea_db"
}

# Function to setup MySQL
setup_mysql() {
    echo "📦 Installing MySQL..."
    sudo apt update
    sudo apt install mysql-server -y
    
    # Secure MySQL installation
    sudo mysql_secure_installation
    
    # Start MySQL service
    sudo systemctl start mysql
    sudo systemctl enable mysql
    
    # Create database and user
    sudo mysql << EOF
CREATE DATABASE yellow_tea_db;
CREATE USER 'yellow_tea_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';
GRANT ALL PRIVILEGES ON yellow_tea_db.* TO 'yellow_tea_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
EOF
    
    echo "✅ MySQL setup complete!"
    echo "📊 Database: yellow_tea_db"
    echo "👤 User: yellow_tea_user"
    echo "🔗 Connection: mysql://yellow_tea_user:your_secure_password_here@localhost:3306/yellow_tea_db"
}

# Function to setup Redis (for caching/sessions)
setup_redis() {
    echo "📦 Installing Redis..."
    sudo apt update
    sudo apt install redis-server -y
    
    # Configure Redis
    sudo sed -i 's/# requirepass foobared/requirepass your_redis_password_here/' /etc/redis/redis.conf
    
    # Start Redis service
    sudo systemctl start redis-server
    sudo systemctl enable redis-server
    
    echo "✅ Redis setup complete!"
    echo "🔗 Connection: redis://:your_redis_password_here@localhost:6379"
}

# Main menu
echo "Choose your database:"
echo "1) PostgreSQL (Recommended for complex queries)"
echo "2) MongoDB (Good for flexible schemas)"
echo "3) MySQL (Traditional relational database)"
echo "4) Setup Redis (for caching/sessions)"
echo "5) Setup all (PostgreSQL + Redis)"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        setup_postgresql
        ;;
    2)
        setup_mongodb
        ;;
    3)
        setup_mysql
        ;;
    4)
        setup_redis
        ;;
    5)
        setup_postgresql
        setup_redis
        ;;
    *)
        echo "❌ Invalid choice. Exiting."
        exit 1
        ;;
esac

echo ""
echo "🔐 Remember to update your .env file with the database connection string!"
echo "📋 Next steps:"
echo "   1. Update /var/www/yellow-tea-backend/.env with database connection"
echo "   2. Run database migrations (if any)"
echo "   3. Restart the backend application" 