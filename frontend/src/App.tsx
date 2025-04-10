import { Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { login } from './api/auth';
import './App.css'
import { Account, Constraint, Goal, Notification, Transaction } from './types/user';
import { createAccount, createTransaction, getAccounts } from './api/finance';
import { createGoal, getGoalProgress, getGoals } from './api/goals';
import { io } from 'socket.io-client';
import { getNotifications, markNotificationRead } from './api/notifications';

const socket = io('http://localhost:5000', {
  autoConnect: false,
  auth: { userId: '' }
});

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (token) {
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

  const handleLogin = async () => {
    try {
      const response = await login('admin@funds.com', 'admin');
      setToken(response.token);
      console.log('Logged in: ', response.user);
    } catch (error) {
      console.error('Login failed: ', error);
    }
  }

  const handleCreateAccount = async () => {
    if (!token) return;
    try {
      const account = await createAccount(token, 'Food', 200);
      setAccounts([...accounts, account]);
    } catch (error) {
      console.error('Account creation failed: ', error);
    }
  }

  const handleGetAccounts = async () => {
    if (!token) return;
    try {
      const fetchedAccounts = await getAccounts(token);
      setAccounts(fetchedAccounts);
    } catch (error) {
      console.error('Fetching accounts failed: ', error);
    }
  }

  const handleCreateTransaction = async () => {
    if (!token || !accounts.length) return;
    try {
      await createTransaction(token, accounts[0]._id, 'expense', 70, 'Groceries');
    } catch (error) {
      console.error('Transaction creation failed: ', error);
    }
  }

  const handleCreateGoal = async () => {
    if (!token || !accounts.length) return;

    try {
      const constraints: Constraint[] = [
        { type: 'min', value: 200 },
        { type: 'percentage', value: 25 },
      ];

      const goal = await createGoal(
        token,
        'Investing',
        500,
        '2025-04-01',
        accounts[0]._id,
        constraints
      );
      setGoals([...goals, goal]);
    } catch (error) {
      console.error('Goal creation failed:', error);
    }
  }

  const handleGetGoals = async () => {
    if (!token) return;
    try {
      const fetchedGoals = await getGoals(token);
      setGoals(fetchedGoals);
    } catch (error) {
      console.error('Fetching goals failed: ', error);
    }
  }

  const handleGetProgress = async (goalId: string) => {
    if (!token) return;
    try {
      const { progress } = await getGoalProgress(token, goalId);
      console.log(`Progress for goal with id=${goalId} is $${progress}`);
    } catch (error) {
      console.error('Fetching goal\'s progress failed: ', error);
    }
  }

  const handleGetNotifications = async () => {
    if (!token) return;
    try {
      const fetchedNotifications = await getNotifications(token);
      setNotifications(fetchedNotifications);
    } catch (error) {
      console.error('Fetching notifications failed: ', error);
    }
  }

  const handleMarkRead = async (id: string) => {
    if (!token) return;
    try {
      const updated = await markNotificationRead(token, id);
      setNotifications((prev) => prev.map((n) => (n._id === id ? updated : n)));
    } catch (error) {
      console.error('Reading notification failed: ', error);
    }
  }

  return (
    <div>
      <h1>funds.io</h1>
      <button onClick={handleLogin}>Test Login</button>
      <button onClick={handleCreateAccount}>Create Food Account</button>
      <button onClick={handleGetAccounts}>Get Accounts</button>
      <button onClick={handleCreateTransaction}>Add $60 Grocery expense</button>
      <button onClick={handleCreateGoal}>Create Goal</button>
      <button onClick={handleGetGoals}>Get Goals</button>
      <button onClick={handleGetNotifications}>Get Notifications</button>
      <p>Token: {token || 'Not logged in'}</p>
      <h2>Accounts</h2>
      <ul>
        {accounts.map((acc) => (
          <li key={acc._id}>
            {acc.name} - Budget: ${acc.budget}
          </li>
        ))}
      </ul>
      <h2>Goals</h2>
      <ul>
        {goals.map((goal) => (
          <li key={goal._id}>
            {goal.name} - Target: ${goal.targetAmount} | Progress: ${goal.progress}
            <button onClick={() => handleGetProgress(goal._id)}>Check progress</button>
          </li>
        ))}
      </ul>
      <h2>Notifications</h2>
      <ul>
        {notifications.map((notification) => (
          <li key={notification._id}>
            {notification.message} - {notification.read ? 'Read' : 'Unread'}
            {!notification.read && <button onClick={() => handleMarkRead(notification._id)}>Mark Read</button>}
          </li>
        ))}
      </ul>
      <Routes>
        <Route path='/' element={<div>Homepage</div>} />
        <Route path='/tracker' element={<div>Tracker page</div>} />
      </Routes>
    </div>
  );
};

export default App;
