import axios from 'axios';
import { API_URL } from '../../constants/app-constants';

/**
 * Axios instance configured with the API base URL.
 */
const api = axios.create({
  baseURL: API_URL,
});

let logoutFn: ((errorMessage?: string) => void) | null = null;

/**
 * Sets the logout function to be called when a 401 Unauthorized error occurs.
 * 
 * @param logout - A function that handles user logout, optionally accepting an error message.
 */
export function setLogoutFunction(logout: (errorMessage?: string) => void) {
  logoutFn = logout;
}

/**
 * Axios response interceptor to handle 401 Unauthorized errors.
 * If a 401 error is detected and a logout function is set, it will call the logout function.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && logoutFn) {
      logoutFn('Session expired. Please log in again.');
    }
    return Promise.reject(error);
  }
);

export default api;