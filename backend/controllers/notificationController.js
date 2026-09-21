const { dbStore } = require('../config/db');

function getNotifications(req, res) {
  const notifications = dbStore.get('notifications');
  return res.json({ success: true, count: notifications.length, notifications });
}

function markAsRead(req, res) {
  const { id } = req.body;
  if (id) {
    dbStore.update('notifications', id, { read: true });
  } else {
    // Mark all as read
    const notifications = dbStore.get('notifications');
    notifications.forEach((n) => dbStore.update('notifications', n.id, { read: true }));
  }
  return res.json({ success: true, message: 'Notifications marked as read' });
}

module.exports = {
  getNotifications,
  markAsRead
};
