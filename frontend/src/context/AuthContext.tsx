import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  token: string | null;
  role: string | null;
  login: (newToken: string) => void;
  logout: (errorMessage?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (token && !role) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role || 'user');
      } catch (error) {
        console.error('Failed to decode token:', error);
        setRole('user');
      }
    }
  }, [token]);

  function login(newToken: string) {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setRole(payload.role || 'user');
    } catch (err) {
      console.error('Failed to decode token:', err);
      setRole('user');
    }
    navigate('/tracker');
  }

  function logout(errorMessage?: string) {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    navigate('/login', { state: { error: errorMessage } });
  }

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}