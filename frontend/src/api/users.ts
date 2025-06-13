import axios from "axios";
import { API_URL } from "../../constants/app-constants";

/**
 * Returns the configuration object for axios requests with the authorization header.
 * @param token - The authentication token.
 * @returns The configuration object.
 */
const getConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});

export async function getProfile(token: string) {
  const response = await axios.get(`${API_URL}/profile`, getConfig(token));
  return response.data;
}

export async function updateProfile(token: string, 
    data: { email?: string; firstName?: string; lastName?: string; password?: string }) {
  const response = await axios.put(`${API_URL}/profile`, data, getConfig(token));
  return response.data;
}

export async function getAllUsers(token: string) {
  const response = await axios.get(`${API_URL}/users`, getConfig(token));
  return response.data;
}

export async function deleteUser(token: string, id: string) {
  const response = await axios.delete(`${API_URL}/users/${id}`, getConfig(token));
  return response.data;
}
