# MongoDB Installation Guide

## Quick Install (Linux/Ubuntu)

### Option 1: Install MongoDB Community Edition (Recommended)

```bash
# Import the public key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu $(lsb_release -cs)/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

### Option 2: Use Docker (Alternative)

```bash
# Run MongoDB in Docker
docker run -d --name mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_DATABASE=aiser \
  mongo:latest

# To stop
docker stop mongodb

# To restart
docker start mongodb
```

### Option 3: Use MongoDB Atlas (Cloud - No local install needed)

1. Sign up at https://www.mongodb.com/atlas
2. Create a free cluster
3. Get connection string
4. Update `backend/.env` with your Atlas connection string:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/aiser
   ```

## Quick Start Without MongoDB

If you want to test the application without MongoDB:

1. The backend will run without database connectivity
2. Authentication and some features will be limited
3. Market data APIs will still work
4. Sample data will be used for portfolio

## Verify Installation

```bash
# Check if MongoDB is running
mongosh --eval "db.runCommand('ping')"

# Or check with netstat
netstat -an | grep 27017
```

## Troubleshooting

### MongoDB won't start
```bash
# Check logs
sudo journalctl -u mongod

# Check if port is in use
sudo lsof -i :27017

# Restart service
sudo systemctl restart mongod
```

### Permission issues
```bash
# Fix ownership
sudo chown -R mongodb:mongodb /var/lib/mongodb
sudo chown mongodb:mongodb /tmp/mongodb-27017.sock
```
