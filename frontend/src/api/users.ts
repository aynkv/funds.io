import axios from "axios";
import { API_URL } from "../../constants/app-constants";
import { getConfig } from './apiUtils';

/**
 * Fetches the profile of the currently authenticated user.
 * @param token - The authentication token.
 * @returns A promise resolving to the user's profile data.
 */
export async function getProfile(token: string) {
  const response = await axios.get(`${API_URL}/profile`, getConfig(token));
  return response.data;
}

/**
 * Updates the profile of the currently authenticated user.
 * @param token - The authentication token.
 * @param data - An object containing the fields to update (email, firstName, lastName, password).
 * @returns A promise resolving to the updated profile data.
 */
export async function updateProfile(
  token: string,
  data: { email?: string; firstName?: string; lastName?: string; password?: string }
) {
  const response = await axios.put(`${API_URL}/profile`, data, getConfig(token));
  return response.data;
}

/**
 * Fetches all users (admin only).
 * @param token - The authentication token.
 * @returns A promise resolving to the list of all users.
 */
export async function getAllUsers(token: string) {
  const response = await axios.get(`${API_URL}/users`, getConfig(token));
  return response.data;
}

/**
 * Deletes a user by ID (admin only).
 * @param token - The authentication token.
 * @param id - The ID of the user to delete.
 * @returns A promise resolving to the deletion result.
 */
export async function deleteUser(token: string, id: string) {
  const response = await axios.delete(`${API_URL}/users/${id}`, getConfig(token));
  return response.data;
}
