import { Notification } from "../types/user";
import "../css/Notifications.css";
import { useState } from "react";
import { FaEye } from "react-icons/fa";

interface NotificationProps {
    notification: Notification;
    onMarkAsRead: (id: string) => void;
}

function NotificationComponent({ notification, onMarkAsRead }: NotificationProps) {
    const { _id, message, type, read, createdAt } = notification;
    const [fading, setFading] = useState(false);

    const handleMarkAsRead = () => {
        setFading(true);
        setTimeout(() => {
            onMarkAsRead(_id);
            setFading(false);
        }, 400);
    };

    return (
        <div className={`notification-card ${type} ${!read ? "unread" : ""} ${fading ? "fading" : ""}`}>
            <div className="notification-content">
                <div className="notification-message">{message}</div>
                <div className="notification-date">{new Date(createdAt).toLocaleString()}</div>
            </div>
            <div className="notification-actions">
                {!read && (
                    <button className="notification-button eye-button" onClick={handleMarkAsRead}>
                        <FaEye />
                    </button>
                )}
            </div>
        </div>
    )

}

export default NotificationComponent;