import Notification from '../models/Notification.js';

// @desc    Get unread notifications for the logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.id, read: false }).sort({ createdAt: -1 });
    res.status(200).json({ status: 'success', data: { notifications } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch notifications.' });
  }
};

// @desc    Mark a notification as read
// @route   PATCH /api/notifications/:id/read
// @access  Private
export const markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { read: true },
      { new: true },
    );

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found.' });
    }

    res.status(200).json({ status: 'success', data: { notification } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to update notification.' });
  }
};