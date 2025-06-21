import { Notification } from "../types/types";
import { markNotificationRead } from "../api/notifications";
import NotificationComponent from "../components/NotificationComponent";
import "../css/Notifications.css";

interface NotificationProps {
    token: string;
    notifications: Notification[],
    onUpdateNotifications: (updated: Notification) => void;
}

function Notifications({ token, notifications, onUpdateNotifications }: NotificationProps) {

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
                // .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(n => (
                    <NotificationComponent
                        key={n._id} notification={n} onMarkAsRead={handleMarkAsRead} />)
                )}
        </div>
    )
}
export default Notifications;