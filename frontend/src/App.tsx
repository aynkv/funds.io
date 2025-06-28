import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './App.css'
import { io } from 'socket.io-client';
import Header from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import About from './pages/About';
import Tracker from './pages/Tracker';
import Summary from './pages/Summary';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';
import Notifications from './pages/Notifications';
import { Notification, Transaction } from './types/types';
import { getTransactions } from './api/finance';
import Footer from './components/Footer';
import { getNotifications } from './api/notifications';
import { AuthProvider, useAuth } from './context/AuthContext';
import { setLogoutFunction } from './api/axios';
import Admin from './pages/Admin';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  auth: { userId: '' }
});

function AppContent() {
  const { token, logout } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    setLogoutFunction(logout);
    if (token) {
      fetchInitialData(token);
      socket.auth = { userId: token };
      socket.connect();

      socket.on('newTransaction', (tx: Transaction) => {
        setTransactions((prev) => [...prev, tx]);
      });

      socket.on('newNotification', (notification: Notification) => {
        setNotifications((prev) => [notification, ...prev]);
      });

      return () => {
        socket.off('newTransaction');
        socket.off('newNotification');
        socket.disconnect();
      }
    }
  }, [token]);

  const fetchInitialData = async (t: string) => {
    try {
      const [fetchedTransactions, fetchedNotifications] = await Promise.all([
        getTransactions(t),
        getNotifications(t),
      ]);
      setTransactions(fetchedTransactions);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Failed to fetch initial data:', error);
    }
  }

  function updateNotifications(updated: Notification) {
    setNotifications((prev) =>
      prev.map((n) => (n._id === updated._id ? updated : n))
    );
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <Header token={token} onLogout={logout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/tracker"
            element={token ? <Tracker token={token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element=
            {token ? (<Notifications
              token={token}
              notifications={notifications}
              onUpdateNotifications={updateNotifications}
            />
            ) : (
              <Navigate to="/login" />
            )}
          />
          <Route
            path="/summary"
            element={token ? <Summary token={token} transactions={transactions} /> : <Navigate to="/login" />}
          />
          <Route
            path="/personal"
            element={token ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={token ? <Admin /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}

export default App;
