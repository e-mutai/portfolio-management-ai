# Quick Start Guide

## Prerequisites
1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **MongoDB** - [Install here](https://docs.mongodb.com/manual/installation/)
3. **RapidAPI Account** - [Sign up here](https://rapidapi.com/)

## 1. Clone and Install
```bash
git clone <your-repo-url>
cd aiser
npm install
cd backend && npm install && cd ..
```

## 2. Setup MongoDB
```bash
# Linux/Ubuntu
sudo systemctl start mongod

# macOS with Homebrew
brew services start mongodb/brew/mongodb-community

# Windows - Start MongoDB service from Services panel
```

## 3. Get RapidAPI Keys
1. Visit [RapidAPI](https://rapidapi.com/)
2. Subscribe to these APIs:
   - **YFinance API**: For international stock data
   - **Nairobi Stock Exchange API**: For NSE data
3. Copy your RapidAPI key

## 4. Configure Environment
```bash
# Run the setup script
./setup.sh

# Or manually:
cp backend/.env.example backend/.env
echo "VITE_API_URL=http://localhost:5000/api" > .env
```

Edit `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/aiser
RAPIDAPI_KEY=your-rapidapi-key-here
JWT_SECRET=your-secret-key-change-this
```

## 5. Run the Application
```bash
npm run dev:full
```

**That's it!** 🎉

- Frontend: http://localhost:8083 (or next available port)
- Backend: http://localhost:5000

## Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running: `ps aux | grep mongod`
- Check MongoDB logs: `sudo journalctl -u mongod`

### Port Already in Use
- Kill processes on ports 5000 or 5173:
  ```bash
  sudo lsof -t -i:5000 | xargs kill -9
  sudo lsof -t -i:5173 | xargs kill -9
  ```

### RapidAPI Issues
- Verify your API key is correct
- Check you're subscribed to the required APIs
- Monitor your usage limits

## Next Steps
1. Create an account on the platform
2. Configure your investment profile
3. Explore market data
4. Get AI-powered investment advice
5. Start building your portfolio!
