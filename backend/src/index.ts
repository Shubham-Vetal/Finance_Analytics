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

dotenv.config();

const app = express();

app.use(cors({ origin: 'http://localhost:5173', credentials: true }));
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());

const MONGO_URL = process.env.MONGO_URI;

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGO_URL);
    console.log('✅ MongoDB Connected');

    // Routes
    app.use('/', authRoutes);
    app.use('/api/transactions', transactionRoutes);
    app.use('/api/user-config', userConfigRoutes);

    // Start server
    const server = http.createServer(app);
    server.listen(8080, () => {
      console.log('Server running on http://localhost:8080');
    });

  } catch (err) {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit the process with failure
  }
};

// Start everything
startServer();
