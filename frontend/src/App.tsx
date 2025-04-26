import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
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
import Users from './pages/Users';
import { Notification, Transaction } from './types/user';
import { getTransactions } from './api/finance';
import Footer from './components/Footer';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  auth: { userId: '' }
});

function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      fetchTransactions();
      socket.auth = { userId: token }; // TODO: think on this
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

  const fetchTransactions = async () => {
    try {
      const fetchedTransactions = await getTransactions(token!);
      setTransactions(fetchedTransactions);
    } catch (error) {
      console.error('Failed to fetch transactions: ', error);
    }
  }

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/tracker');
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    socket.disconnect();
    setTransactions([]);
    setNotifications([]);
  }

  return (
    <div className="page-container">
      <div className="content-wrap">
        <Header token={token} onLogout={handleLogout} />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login onLogin={handleLogin} />} />
          <Route path="/register" element={<Register onRegister={handleLogin} />} />
          <Route path="/about" element={<About />} />
          <Route
            path="/tracker"
            element={token ? <Tracker token={token} transactions={transactions} /> : <Navigate to="/login" />}
          />
          <Route
            path="/summary"
            element={token ? <Summary /> : <Navigate to="/login" />}
          />
          <Route
            path="/personal"
            element={token ? <Profile /> : <Navigate to="/login" />}
          />
          <Route
            path="/dashboard"
            element={token ? <Dashboard token={token} /> : <Navigate to="/login" />}
          />
          <Route
            path="/notifications"
            element={token ? <Notifications /> : <Navigate to="/login" />}
          />
          <Route
            path="/users"
            element={token ? <Users /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
      <Footer />
    </div>
  );
};

export default App;
