import { Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { login } from './api/auth';
import './App.css'
import { Account, Transaction } from './types/user';
import { createAccount, createTransaction, getAccounts } from './api/finance';

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const handleLogin = async () => {
    try {
      const response = await login('test@example.com', 'password123');
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
    if (!token) return;
    try {
      const transaction = await createTransaction(token, accounts[0]._id, 'expense', 50, 'Groceries');
      setTransactions([...transactions, transaction]);
    } catch (error) {
      console.error('Transaction creation failed: ', error);
    }
  }

  return (
    <div>
      <h1>funds.io</h1>
      <button onClick={handleLogin}>Test Login</button>
      <button onClick={handleCreateAccount}>Create Food Account</button>
      <button onClick={handleGetAccounts}>Get Accounts</button>
      <button onClick={handleCreateTransaction}>Add $50 Grocery expense</button>
      <p>Token: {token || 'Not logged in'}</p>
      <h2>Accounts</h2>
      <ul>
        {accounts.map((acc) => (
          <li key={acc._id}>
            {acc.name} - Budget: ${acc.budget}
          </li>
        ))}
      </ul>
      <h2>Transactions</h2>
      <ul>
        {transactions.map((tx) => (
          <li key={tx._id}>
            {tx.type}: ${tx.amount} ({tx.category})
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
