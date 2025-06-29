import express from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compression from 'compression';
import mongoose from 'mongoose';
import authRoutes from './router/index';
import transactionRoutes from './router/transaction.routes';
import userConfigRoutes from './router/userConfig.routes';

console.log('🔥 Server entry point reached');

dotenv.config(); // Ensure this is at the very top to load environment variables

const app = express();

// --- START: CORRECTED CORS CONFIGURATION ---
// Determine frontend origins based on the environment
const FE_DEV_ORIGIN = 'http://localhost:5173'; // Your React development server URL

// IMPORTANT: You MUST set 'FRONTEND_PROD_URL' as an environment variable
// on your Render backend service dashboard. Its value should be the full HTTPS URL
// of your deployed frontend (e.g., https://your-finance-frontend.onrender.com).
const FE_PROD_ORIGIN = process.env.FRONTEND_PROD_URL;

const allowedOrigins = [FE_DEV_ORIGIN];
if (FE_PROD_ORIGIN) {
  allowedOrigins.push(FE_PROD_ORIGIN);
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
}));


// --- END: CORRECTED CORS CONFIGURATION ---

app.use(compression());
app.use(cookieParser()); // Ensure cookieParser is placed before any routes that access req.cookies
app.use(bodyParser.json()); // Parses incoming JSON requests

const MONGO_URL = process.env.MONGO_URI; // Ensure MONGO_URI is set as an environment variable on Render

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB Connected');

    // Routes
    app.use('/', authRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/user-config', userConfigRoutes);

    // Use dynamic port from Render (process.env.PORT) or default to 8080
    const PORT = process.env.PORT || 8080;
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure if MongoDB connection fails
  }
};

// Start everything
startServer();