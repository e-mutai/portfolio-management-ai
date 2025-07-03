#!/bin/bash

echo "🚀 Setting up Aiser Backend..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB first."
    echo "   - Install MongoDB: https://docs.mongodb.com/manual/installation/"
    echo "   - Start MongoDB: sudo systemctl start mongod (Linux) or brew services start mongodb/brew/mongodb-community (macOS)"
    exit 1
fi

# Check if .env file exists
if [ ! -f "backend/.env" ]; then
    echo "📝 Creating backend/.env file from template..."
    cp backend/.env.example backend/.env
    echo "✅ Environment file created at backend/.env"
    echo "⚠️  Please edit backend/.env with your MongoDB URI and RapidAPI key"
else
    echo "✅ Backend environment file already exists"
fi

# Check if frontend .env exists
if [ ! -f ".env" ]; then
    echo "📝 Creating frontend .env file..."
    echo "VITE_API_URL=http://localhost:5000/api" > .env
    echo "✅ Frontend environment file created"
else
    echo "✅ Frontend environment file already exists"
fi

# Install dependencies if not already installed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing frontend dependencies..."
    npm install
fi

if [ ! -d "backend/node_modules" ]; then
    echo "📦 Installing backend dependencies..."
    cd backend && npm install && cd ..
fi

echo ""
echo "🎉 Setup complete! Next steps:"
echo "1. Make sure MongoDB is running"
echo "2. Edit backend/.env with your RapidAPI key and MongoDB URI"
echo "3. Run: npm run dev:full"
echo ""
echo "The application will be available at:"
echo "  Frontend: http://localhost:5173"
echo "  Backend:  http://localhost:5000"
