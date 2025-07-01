import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import axios from '@/lib/axios';

// --- User and API response types ---
interface User {
  _id: string;
  username: string;
  email: string;
}

interface MeResponse {
  user: User;
}
interface RegisterResponse {
  message: string;
  user: User;
}
interface LoginResponse {
  user: User;
}

interface AuthCredentials {
  email: string;
  password: string;
}
interface RegisterData extends AuthCredentials {
  username: string;
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  fetchUser: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  login: (data: AuthCredentials) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// --- Context creation ---
const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // ✅ useCallback prevents new function reference on every render
  const fetchUser = useCallback(async () => {
    try {
      const res = await axios.get<MeResponse>('/auth/me');
      setUser(res.data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const register = async (data: RegisterData) => {
    await axios.post<RegisterResponse>('/auth/register', data);
    await fetchUser();
  };

  const login = async (data: AuthCredentials) => {
    await axios.post<LoginResponse>('/auth/login', data);
    await fetchUser();
  };

  const logout = async () => {
    await axios.post('/auth/logout');
    setUser(null);
  };

  const updateUser = async (updatedUser: Partial<User>) => {
    const res = await axios.put<MeResponse>('/auth/update', updatedUser);
    setUser(res.data.user);
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    await axios.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
  };

  // ✅ fetchUser runs only once on mount now
  useEffect(() => {
    console.log('🔁 Checking session...');
    fetchUser();
  }, [fetchUser]);

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        setUser,
        fetchUser,
        register,
        login,
        logout,
        updateUser,
        changePassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
};
