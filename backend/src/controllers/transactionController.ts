import { Request, Response } from 'express';
import { TransactionModel } from '../db/Transaction';
import { get } from 'lodash';

// ------------------------
// Create Transaction
// ------------------------
export const createTransaction = async (req: Request, res: Response) => {
  try {
    const userId = get(req, 'identity._id');
    const { amount, category, type, status, date, description } = req.body;

    const transaction = await TransactionModel.create({
      user: userId,
      amount,
      category,
      type,
      status,
      date,
      description,
    });

    res.status(201).json({ message: 'Transaction created', transaction });
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------------
// Get All Transactions (Filter, Sort, Paginate)
// ------------------------
export const getTransactions = async (req: Request, res: Response) => {
  try {
    const userId = get(req, 'identity._id');
    const {
      page = 1,
      limit = 10,
      search = '',
      sortBy = 'date',
      order = 'desc',
      category,
      type,
      status,
      startDate,
      endDate,
    } = req.query;

    const filters: any = { user: userId };

    if (category) filters.category = category;
    if (type) filters.type = type;
    if (status) filters.status = status;
    if (startDate || endDate) {
      filters.date = {};
      if (startDate) filters.date.$gte = new Date(startDate as string);
      if (endDate) filters.date.$lte = new Date(endDate as string);
    }

    if (search) {
      filters.$or = [
        { category: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const transactions = await TransactionModel.find(filters)
      .sort({ [sortBy as string]: order === 'asc' ? 1 : -1 })
      .skip((+page - 1) * +limit)
      .limit(+limit);

    const total = await TransactionModel.countDocuments(filters);

    res.status(200).json({ data: transactions, total });
  } catch (error) {
    console.error('Get Transactions Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------------
// Update Transaction
// ------------------------
export const updateTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;
    const updates = req.body;

    const transaction = await TransactionModel.findByIdAndUpdate(transactionId, updates, { new: true });

    res.status(200).json({ message: 'Transaction updated', transaction });
  } catch (error) {
    console.error('Update Transaction Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------------
// Delete Transaction
// ------------------------
export const deleteTransaction = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.id;

    await TransactionModel.findByIdAndDelete(transactionId);

    res.status(200).json({ message: 'Transaction deleted' });
  } catch (error) {
    console.error('Delete Transaction Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------------
// Summary: Income vs Expenses
// ------------------------
export const getSummary = async (req: Request, res: Response) => {
  try {
    const userId = get(req, 'identity._id');

    const summary = await TransactionModel.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({ summary });
  } catch (error) {
    console.error('Summary Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};

// ------------------------
// Breakdown: By Category
// ------------------------
export const getBreakdownByCategory = async (req: Request, res: Response) => {
  try {
    const userId = get(req, 'identity._id');

    const breakdown = await TransactionModel.aggregate([
      { $match: { user: userId } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({ breakdown });
  } catch (error) {
    console.error('Breakdown Error:', error);
    res.status(500).json({ message: 'Something went wrong' });
  }
};
