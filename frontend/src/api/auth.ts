import axios from 'axios';
import { AuthResponse } from '../types/user';

const API_URL = 'http://localhost:5000/api';

export const register = async (email: string, name: string, password: string) => {
    const response = await axios.post(`${API_URL}/register`, { email, name, password });
    return response.data as AuthResponse;
};

export const login = async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data as AuthResponse;
};