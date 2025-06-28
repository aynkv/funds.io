import axios from 'axios';
import { AuthResponse } from '../types/types';
import { API_URL } from '../../constants/app-constants';

/**
 * Registers a new user with the provided email and password.
 *
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to an AuthResponse object.
 */
export const register = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/register`, { email, name, password });
    return response.data;
};

/**
 * Logs in a user with the provided email and password.
 *
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns A promise that resolves to an AuthResponse object.
 */
export const login = async (email: string, password: string): Promise<AuthResponse> => {
    const response = await axios.post(`${API_URL}/login`, { email, password });
    return response.data;
};