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

dotenv.config(); // ✅ load env variables first

const app = express();

// ✅ Define allowed origins
const FE_DEV_ORIGIN = 'http://localhost:5173';

const FE_PROD_ORIGIN = process.env.FRONTEND_PROD_URL?.replace(/\/$/, ''); // remove trailing slash if any

const allowedOrigins = [FE_DEV_ORIGIN];
if (FE_PROD_ORIGIN) allowedOrigins.push(FE_PROD_ORIGIN);

// ✅ CORS middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));


app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

// ✅ MongoDB Connection
const MONGO_URL = process.env.MONGO_URI;
if (!MONGO_URL) {
  console.error('❌ MONGO_URI is not defined in environment');
  process.exit(1);
}

// ✅ Start Server
const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB Connected');

    app.use('/', authRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/user-config', userConfigRoutes);

    const PORT = process.env.PORT || 8080;
    const server = http.createServer(app);
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  }
};

startServer();
