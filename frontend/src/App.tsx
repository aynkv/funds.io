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

const socket = io('http://localhost:5000', {
  autoConnect: false,
  auth: { userId: '' }
});

const App: React.FC = () => {
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token) {
      socket.auth = { userId: token }; // TODO: think on this
      socket.connect();
      return () => {
        socket.disconnect();
      }
    }
  }, [token]);

  const handleLogin = (newToken: string) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    navigate('/tracker');
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
    socket.disconnect();
  }

  return (
    <div>
      <Header token={token} onLogout={handleLogout} />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login onLogin={handleLogin} />} />
        <Route path='/register' element={<Register onRegister={handleLogin} />} />
        <Route path='/about' element={<About />} />

        <Route
          path='/tracker'
          element={token ? <Tracker /> : <Navigate to="/login" />}
        />
        <Route
          path='/summary'
          element={token ? <Summary /> : <Navigate to="/login" />}
        />
        <Route
          path='/personal'
          element={token ? <Profile /> : <Navigate to="/login" />}
        />
        <Route
          path='/dashboard'
          element={token ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route
          path='/notifications'
          element={token ? <Notifications /> : <Navigate to="/login" />}
        />
        <Route
          path='/users'
          element={token ? <Users /> : <Navigate to="/login" />}
        />
      </Routes>
    </div>
  );
};

export default App;
