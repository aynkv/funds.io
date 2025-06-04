import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

let logoutFn: ((errorMessage?: string) => void) | null = null;

export function setLogoutFunction(logout: (errorMessage?: string) => void) {
  logoutFn = logout;
}

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