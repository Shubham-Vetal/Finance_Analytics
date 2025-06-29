import express from 'express';
import {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getSummary,
  getBreakdownByCategory,
} from '../controllers/transactionController';
import { isAuthenticated } from '../middlewares/index';

const router = express.Router();

// POST /api/transactions/auth/createtransaction
router.post('/auth/createtransaction', isAuthenticated, createTransaction);

// GET /api/transactions/auth/gettransactions
router.get('/auth/gettransactions', isAuthenticated, getTransactions);

// PUT /api/transactions/auth/:id
router.put('/auth/:id', isAuthenticated, updateTransaction);

// DELETE /api/transactions/auth/:id
router.delete('/auth/:id', isAuthenticated, deleteTransaction);

// GET /api/transactions/auth/summary
router.get('/auth/summary', isAuthenticated, getSummary);

// GET /api/transactions/auth/breakdown
router.get('/auth/breakdown', isAuthenticated, getBreakdownByCategory);

export default router;
