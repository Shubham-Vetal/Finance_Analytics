import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

export interface Transaction {
  _id: string;
  user: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  status: 'completed' | 'pending' | 'failed';
  date: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface SummaryItem {
  _id: string; // 'income' or 'expense'
  total: number;
}

export interface CategoryBreakdownItem {
  _id: string; // Category name
  total: number;
}

// ✅ Re-added: Axios Response Types for backend summary and breakdown
interface TransactionsResponse {
  data: Transaction[];
  total: number;
}

interface CreateTransactionResponse {
  message: string;
  transaction: Transaction;
}

interface SummaryResponse {
  summary: SummaryItem[];
}

interface BreakdownResponse {
  breakdown: CategoryBreakdownItem[];
}

interface TransactionContextType {
  transactions: Transaction[];
  fetchTransactions: () => Promise<void>;
  addTransaction: (data: Omit<Transaction, '_id' | 'user' | 'createdAt' | 'updatedAt' | '__v' | 'date'>) => Promise<void>;
  updateTransaction: (id: string, updatedData: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  getSummary: () => Promise<SummaryItem[]>; // This now calls the backend summary route
  getBreakdown: () => Promise<CategoryBreakdownItem[]>;
  setTransactions: (txs: Transaction[]) => void;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Fetches all transactions from the backend
  const fetchTransactions = async () => {
    try {
      const res = await axios.get<TransactionsResponse>('/api/transactions/auth/gettransactions');
      setTransactions(res.data.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
      // Optionally add a message here using useMessages if needed
    }
  };

  const addTransaction = async (
    data: Omit<Transaction, '_id' | 'user' | 'createdAt' | 'updatedAt' | '__v' | 'date'>
  ) => {
    try {
      const res = await axios.post<CreateTransactionResponse>(
        '/api/transactions/auth/createtransaction',
        data
      );
      if (res.status === 201 || res.status === 200) {
        await fetchTransactions(); // Re-fetch all transactions to keep main list updated
      }
    } catch (error) {
      console.error('Failed to add transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updatedData: Partial<Transaction>) => {
    try {
      const res = await axios.put<{ message: string; transaction: Transaction }>(
        `/api/transactions/auth/${id}`,
        updatedData
      );
      if (res.status === 200) {
        await fetchTransactions(); // Re-fetch all transactions
      }
    } catch (error) {
      console.error('Failed to update transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const res = await axios.delete<{ message: string }>(`/api/transactions/auth/${id}`);
      if (res.status === 200) {
        await fetchTransactions(); // Re-fetch all transactions
      }
    } catch (error) {
      console.error('Failed to delete transaction:', error);
      throw error;
    }
  };

  // ✅ MODIFIED getSummary: Now calling the backend summary API
  const getSummary = async (): Promise<SummaryItem[]> => {
    try {
      const res = await axios.get<SummaryResponse>('/api/transactions/auth/summary');
      // Assuming your backend returns { summary: [{ _id: 'income', total: X }, { _id: 'expense', total: Y }] }
      return res.data.summary;
    } catch (error) {
      console.error('Failed to fetch summary from backend:', error);
      return []; // Return empty array on error
    }
  };

  // Keep getBreakdown as a backend call
  const getBreakdown = async (): Promise<CategoryBreakdownItem[]> => {
    try {
      const res = await axios.get<BreakdownResponse>('/api/transactions/auth/breakdown');
      return res.data.breakdown || [];
    } catch (error) {
      console.error('Failed to fetch breakdown from backend:', error);
      return [];
    }
  };

  useEffect(() => {
    fetchTransactions();
    // No need to call getSummary here, as components consuming it will call it themselves
  }, []);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        fetchTransactions,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        getSummary, // This is now your backend-driven summary
        getBreakdown,
        setTransactions
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const ctx = useContext(TransactionContext);
  if (!ctx) throw new Error('useTransactions must be used within a TransactionProvider');
  return ctx;
};