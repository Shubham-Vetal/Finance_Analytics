// src/context/UserConfigContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from '@/lib/axios';

// Define the shape of the configuration data
interface UserConfig {
  csvColumns: string[];
}

interface UserConfigResponse {
  config: UserConfig;
}

interface SaveUserConfigResponse {
  message: string;
  config: UserConfig;
}

interface UserConfigContextType {
  csvColumns: string[];
  setCsvColumns: (columns: string[]) => void;
  fetchConfig: () => Promise<void>;
  saveConfig: (columns: string[]) => Promise<void>;
}

const UserConfigContext = createContext<UserConfigContextType | undefined>(undefined);

// Helper to compare arrays
const arraysEqual = (a: string[], b: string[]) =>
  a.length === b.length && a.every((v, i) => v === b[i]);

export const UserConfigProvider = ({ children }: { children: ReactNode }) => {
  const [csvColumns, setCsvColumns] = useState<string[]>([]);

  const fetchConfig = async () => {
    try {
      const res = await axios.get<UserConfigResponse>('/api/user-config/auth/user-config/get');
      const newColumns = res.data.config.csvColumns;
      if (!arraysEqual(newColumns, csvColumns)) {
        setCsvColumns(newColumns);
      }
    } catch (err) {
      console.log(' No config found or user not logged in, using default.');
      setCsvColumns([]);
    }
  };

  const saveConfig = async (columns: string[]) => {
    try {
      const res = await axios.post<SaveUserConfigResponse>(
        '/api/user-config/auth/user-config/save',
        { csvColumns: columns }
      );
      const updatedColumns = res.data.config.csvColumns;
      if (!arraysEqual(updatedColumns, csvColumns)) {
        setCsvColumns(updatedColumns);
      }
    } catch (err) {
      console.error(' Failed to save user config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <UserConfigContext.Provider
      value={{ csvColumns, setCsvColumns, fetchConfig, saveConfig }}
    >
      {children}
    </UserConfigContext.Provider>
  );
};

export const useUserConfig = () => {
  const ctx = useContext(UserConfigContext);
  if (!ctx) throw new Error('useUserConfig must be used within a UserConfigProvider');
  return ctx;
};
