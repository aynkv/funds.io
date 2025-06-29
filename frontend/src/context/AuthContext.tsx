import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * AuthContextType defines the shape of the authentication context.
 * @property token - The JWT token string or null if not authenticated.
 * @property role - The user's role (e.g., 'user', 'admin') or null if not set.
 * @property login - Function to log in and set the token.
 * @property logout - Function to log out and optionally show an error message.
 */
interface AuthContextType {
  token: string | null;
  role: string | null;
  userId: string | null;
  login: (newToken: string) => void;
  logout: (errorMessage?: string) => void;
}

/**
 * React context for authentication state and actions.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provides authentication state and actions to its children.
 * Handles token storage, role extraction from JWT, and navigation on login/logout.
 *
 * @param children - The child React nodes to render within the provider.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [role, setRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (token && !role) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role || 'user');
        setUserId(payload.id || null);
      } catch (error) {
        console.error('Failed to decode token:', error);
        setRole('user');
      }
    }
  }, [token]);

  /**
   * Logs in the user by saving the token and extracting the role.
   * Navigates to the tracker page after login.
   * 
   * @param newToken - The JWT token string.
   */
  function login(newToken: string) {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    try {
      const payload = JSON.parse(atob(newToken.split('.')[1]));
      setRole(payload.role || 'user');
      setUserId(payload._id || null);
    } catch (err) {
      console.error('Failed to decode token:', err);
      setRole('user');
    }
    navigate('/tracker');
  }

  /**
   * Logs out the user by clearing the token and role.
   * Navigates to the login page and optionally passes an error message.
   * 
   * @param errorMessage - Optional error message to display on the login page.
   */
  function logout(errorMessage?: string) {
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    navigate('/login', { state: { error: errorMessage } });
  }

  return (
    <AuthContext.Provider value={{ token, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to access the authentication context.
 * Throws an error if used outside of an AuthProvider.
 * 
 * @returns The authentication context value.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}