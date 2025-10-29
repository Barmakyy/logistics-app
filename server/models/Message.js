import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      required: [true, 'Sender name is required'],
    },
    email: {
      type: String,
      required: [true, 'Sender email is required'],
      lowercase: true,
    },
    subject: {
      type: String,
      required: [true, 'Message subject is required'],
    },
    body: {
      type: String,
      required: [true, 'Message body is required'],
    },
    status: {
      type: String,
      enum: ['Unread', 'Replied', 'Spam', 'Archived'],
      default: 'Unread',
    },
    // Optionally link to a User if the sender is a registered customer
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }, // Adds createdAt and updatedAt
);

const Message = mongoose.model('Message', messageSchema);
export default Message;