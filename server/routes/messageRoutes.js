import express from 'express';
import {
  getMessages,
  getMessageSummary,
  updateMessageStatus,
  deleteMessage,
  createMessage,
  replyToMessage,
} from '../controllers/messageController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// Public route for creating a message from the contact form
router.post('/', createMessage);

// All subsequent routes are protected and for admins only
router.use(protect, restrictTo('admin'));
router.get('/', getMessages);
router.get('/summary', getMessageSummary);
router.post('/:id/reply', replyToMessage);
router.route('/:id').put(updateMessageStatus).delete(deleteMessage);

export default router;