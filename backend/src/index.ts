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

// Load environment variables early
dotenv.config();

console.log('🔥 Server entry point reached');

const app = express();

// ✅ Determine frontend origins
const LOCAL_ORIGIN = 'http://localhost:5173';
const PROD_ORIGIN = process.env.FRONTEND_PROD_URL || 'https://finance-analytics.onrender.com';

const allowedOrigins = [LOCAL_ORIGIN];
if (PROD_ORIGIN && !allowedOrigins.includes(PROD_ORIGIN)) {
  allowedOrigins.push(PROD_ORIGIN);
}

// ✅ CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('❌ Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ✅ Middlewares
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// ✅ MongoDB URI check
const MONGO_URL = process.env.MONGO_URI;
if (!MONGO_URL) {
  console.error('❌ MONGO_URI is not set in environment variables.');
  process.exit(1);
}

// ✅ Start Server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB Connected');

    // ✅ Register routes
    app.use('/', authRoutes); // /auth/*
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/user-config', userConfigRoutes);

    const PORT = process.env.PORT || 8080;
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
