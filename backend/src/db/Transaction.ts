// src/models/Transaction.ts
import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true }, // e.g., "Salary", "Food", "Utilities"
  type: { type: String, enum: ['income', 'expense'], required: true },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'completed' },
  date: { type: Date, default: Date.now },
  description: { type: String },
}, { timestamps: true });

export const TransactionModel = mongoose.model('Transaction', TransactionSchema);
