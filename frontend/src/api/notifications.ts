import axios from "axios";
import { API_URL } from "../../constants/app-constants";
import { Notification } from "../types/types";

const getConfig = (token: string) => ({
    headers: { Authorization: `Bearer ${token}` },
});

export const getNotifications = async (token: string) => {
    const response = await axios.get(`${API_URL}/notifications/`, getConfig(token));
    return response.data as Notification[];
};

export const markNotificationRead = async (token: string, id: string) => {
    const response = await axios.put(`${API_URL}/notifications/${id}/read`, {}, getConfig(token));
    return response.data as Notification;
}