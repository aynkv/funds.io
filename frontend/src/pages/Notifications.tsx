import { Notification } from "../types/types";
import { getNotifications, markNotificationRead } from "../api/notifications";
import NotificationComponent from "../components/NotificationComponent";
import "../css/Notifications.css";
import { useEffect } from "react";

interface NotificationProps {
    token: string;
    notifications: Notification[],
    onUpdateNotifications: (updated: Notification) => void;
}

function Notifications({ token, notifications, onUpdateNotifications }: NotificationProps) {

    useEffect(() => {
        const fetchLatest = async () => {
            try {
                const fresh = await getNotifications(token);
                fresh.forEach(n => onUpdateNotifications(n));
            } catch (err) {
                console.error("Failed to refresh notifications", err);
            }
        };
        fetchLatest();
    }, [token]);

    async function handleMarkAsRead(id: string) {
        try {
            const updatedNotification = await markNotificationRead(token, id);
            onUpdateNotifications(updatedNotification);
        } catch (error) {
            console.error('Failed to read notification:', error);
        }
    }

    return (
        <div className="notifications-container">
            <h1>Notifications</h1>
            <p>All your notifications, budget and spending alerts.</p>

            {notifications
                .map(n => (
                    <NotificationComponent
                        key={n._id} notification={n} onMarkAsRead={handleMarkAsRead} />)
                )}
        </div>
    )
}
export default Notifications;