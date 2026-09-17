import { APICore } from "../../helpers/api/apiCore";

const api = new APICore();

// Get user notifications
export function getNotifications(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return api.get(`/api/v1/user/notification${queryString ? '?' + queryString : ''}`);
}

// Mark notification as read
export function markAsRead(notificationId) {
    return api.update(`/api/v1/user/notification/${notificationId}/read`, {});
}

// Mark all notifications as read
export function markAllAsRead() {
    return api.update('/api/v1/user/notification/read-all', {});
}

// Delete notification
export function deleteNotification(notificationId) {
    return api.delete(`/api/v1/user/notification/${notificationId}`);
}