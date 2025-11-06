import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      // The user who receives the notification
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    link: {
      // A URL to navigate to when clicked
      type: String,
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;