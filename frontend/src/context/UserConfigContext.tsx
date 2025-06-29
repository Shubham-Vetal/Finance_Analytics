// src/context/UserConfigContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';

// Define the shape of the configuration data
interface UserConfig {
  csvColumns: string[];
}

// Define the shape of the API response for fetching config
interface UserConfigResponse {
  config: UserConfig;
}

// Interface for the save config response, assuming it returns config and a message
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

export const UserConfigProvider = ({ children }: { children: ReactNode }) => {
  const [csvColumns, setCsvColumns] = useState<string[]>([]);

  const fetchConfig = async () => {
    try {
      // Endpoint matched exactly to your Postman GET request
      const res = await axios.get<UserConfigResponse>('/api/user-config/auth/user-config/get');
      setCsvColumns(res.data.config.csvColumns);
    } catch (err) {
      console.log(' No config found or user not logged in, using default.');
      setCsvColumns([]);
    }
  };

  const saveConfig = async (columns: string[]) => {
    try {
      // Endpoint updated to exactly match the combined backend routing, as clarified
      const res = await axios.post<SaveUserConfigResponse>('/api/user-config/auth/user-config/save', { csvColumns: columns });
      setCsvColumns(res.data.config.csvColumns); // Update state from saved config
    } catch (err) {
      console.error(' Failed to save user config:', err);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <UserConfigContext.Provider value={{ csvColumns, setCsvColumns, fetchConfig, saveConfig }}>
      {children}
    </UserConfigContext.Provider>
  );
};

export const useUserConfig = () => {
  const ctx = useContext(UserConfigContext);
  if (!ctx) throw new Error('useUserConfig must be used within a UserConfigProvider');
  return ctx;
};
