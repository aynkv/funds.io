import axios from "axios";
import { API_URL } from "../../constants/app-constants";
import { Notification } from "../types/types";
import { getConfig } from "./apiUtils";

/**
 * Fetches all notifications for the authenticated user.
 * @param token - The authentication token.
 * @returns A promise resolving to an array of Notification objects.
 */
export const getNotifications = async (token: string): Promise<Notification[]> => {
    const response = await axios.get(`${API_URL}/notifications`, getConfig(token));
    return response.data;
};

/**
 * Marks a notification as read.
 * @param token - The authentication token.
 * @param id - The ID of the notification to mark as read.
 * @returns A promise resolving to the updated Notification object.
 */
export const markNotificationRead = async (token: string, id: string): Promise<Notification> => {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, getConfig(token));
    return response.data;
};