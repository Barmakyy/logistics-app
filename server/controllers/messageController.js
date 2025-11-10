import Message from '../models/Message.js';
import User from '../models/User.js';
import sendEmail from '../utils/email.js';

// @desc    Get all messages with pagination, search, and filtering
// @route   GET /api/messages
// @access  Private/Admin
export const getMessages = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'All';

    const query = {};

    if (search) {
      query.$or = [
        { sender: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { body: { $regex: search, $options: 'i' } },
      ];
    }

    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }

    const messages = await Message.find(query)
      .populate('user', 'name') // If messages are linked to registered users
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Message.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        messages,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get message summary statistics
// @route   GET /api/messages/summary
// @access  Private/Admin
export const getMessageSummary = async (req, res) => {
  try {
    const totalMessages = await Message.countDocuments();
    const unreadMessages = await Message.countDocuments({ status: 'Unread' });
    const repliedMessages = await Message.countDocuments({ status: 'Replied' });
    const spamMessages = await Message.countDocuments({ status: 'Spam' });

    res.status(200).json({
      status: 'success',
      data: {
        totalMessages,
        unreadMessages,
        repliedMessages,
        spamMessages,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update message status (e.g., mark as read, replied, spam)
// @route   PUT /api/messages/:id/status
// @access  Private/Admin
export const updateMessageStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['Unread', 'Replied', 'Spam', 'Archived'].includes(status)) {
      return res.status(400).json({ status: 'fail', message: 'Invalid status provided' });
    }

    const message = await Message.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({ status: 'fail', message: 'Message not found' });
    }

    res.status(200).json({ status: 'success', data: { message } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete a message
// @route   DELETE /api/messages/:id
// @access  Private/Admin
export const deleteMessage = async (req, res) => {
  try {
    const message = await Message.findByIdAndDelete(req.params.id);

    if (!message) {
      return res.status(404).json({ status: 'fail', message: 'Message not found' });
    }

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Create a new message from a public form
// @route   POST /api/messages
// @access  Public
export const createMessage = async (req, res) => {
  try {
    const { sender, email, subject, body } = req.body;

    // Basic validation
    if (!sender || !email || !subject || !body) {
      return res.status(400).json({ status: 'fail', message: 'Please provide all required fields.' });
    }

    // Optionally, find if the user is registered
    const user = await User.findOne({ email });

    const newMessage = await Message.create({
      sender,
      email,
      subject,
      body,
      user: user ? user._id : null, // Link to user if they exist
    });

    res.status(201).json({ status: 'success', data: { message: newMessage } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Reply to a message
// @route   POST /api/messages/:id/reply
// @access  Private/Admin
export const replyToMessage = async (req, res) => {
  try {
    const { replyBody } = req.body;
    const message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ status: 'fail', message: 'Message not found' });
    }

    if (!replyBody) {
      return res.status(400).json({ status: 'fail', message: 'Reply body is required.' });
    }

    // --- Send the actual email ---
    try {
      await sendEmail({
        to: message.email,
        subject: `Re: ${message.subject}`,
        html: `<p>Hello ${message.sender},</p><p>${replyBody}</p><p>Best regards,<br/>BongoExpress Team</p>`,
      });

      // Update the message status to 'Replied' only after the email is sent
      message.status = 'Replied';
      message.reply = replyBody; // Save the reply text to the message
      await message.save();
    } catch (emailError) {
      console.error('EMAIL SENDING ERROR: ', emailError);
      return res.status(500).json({ status: 'error', message: 'Failed to send email reply. Please try again later.' });
    }

    res.status(200).json({ status: 'success', message: 'Reply sent successfully.', data: { message } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};