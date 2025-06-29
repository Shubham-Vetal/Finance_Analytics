import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { TransactionProvider } from './context/TransactionContext';
import { UserConfigProvider } from './context/UserConfigContext';
import { MessageProvider } from './context/MessageContext';
// ✅ Import OUR custom ThemeProvider
import { ThemeProvider } from './context/ThemeContext'; // Corrected import path

import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import { Toaster } from 'sonner';


const LoadingScreen: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-900 text-white text-xl">
    Loading user session...
  </div>
);


const App: React.FC = () => {
  return (
    // ✅ Now this ThemeProvider is the one from our custom context
    <ThemeProvider>
      <UserProvider>
        <TransactionProvider>
          <UserConfigProvider>
            <MessageProvider>
              <Toaster position="top-right" richColors />
              <AppContent />
            </MessageProvider>
          </UserConfigProvider>
        </TransactionProvider>
      </UserProvider>
    </ThemeProvider>
  );
};

// Component to handle conditional rendering based on auth state
const AppContent: React.FC = () => {
  const { user, fetchUser } = useUser();
  const [loadingInitialAuth, setLoadingInitialAuth] = useState(true);

  useEffect(() => {
    // Fetch user on initial load to determine session status
    const checkAuth = async () => {
      await fetchUser();
      setLoadingInitialAuth(false); // Set loading to false once fetchUser completes
    };
    checkAuth();
  }, [fetchUser]);

  if (loadingInitialAuth) {
    return <LoadingScreen />; // Show loading screen while checking auth
  }

  return (
    <Routes>
      <Route path="/login" element={<Login />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={user ? <DashboardLayout /> : <Navigate to="/login" replace />}
      />
      <Route path="*" element={user ? <Navigate to="/" replace /> : <Navigate to="/login" replace />} />
    </Routes>
  );
};

export default App;