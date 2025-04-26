import { useEffect, useState } from "react";
import { Notification } from "../types/user";
import { getNotifications, markNotificationRead } from "../api/notifications";
import NotificationComponent from "../components/NotificationComponent";
import "../css/Notifications.css";

function Notifications({ token }: { token: string }) {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    async function fetchNotifications() {
        try {
            const fetchedNotifications = await getNotifications(token);
            setNotifications(fetchedNotifications);
        } catch (error) {
            console.error('Failed to fetch dashboard data:', error);
        }
    }

    async function handleMarkAsRead(id: string) {
        try {
            const updatedNotification = await markNotificationRead(token, id);

            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? updatedNotification : n))
            )
        } catch (error) {
            console.error('Failed to read notification:', error);
        }
    }

    return (
        <div className="notifications-container">
            <h1>Notifications</h1>
            <p>All your notifications, budget and spending alerts.</p>

            {notifications.map(n => (
                <NotificationComponent
                    key={n._id} notification={n} onMarkAsRead={handleMarkAsRead} />)
            )}
        </div>
    )
}
export default Notifications;