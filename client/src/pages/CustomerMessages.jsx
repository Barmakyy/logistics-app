import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { FaInbox, FaPaperPlane, FaSpinner, FaPlus, FaTrash } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import api from '../api/axios';
import { format, parseISO, formatDistanceToNow } from 'date-fns';

// A small component for the status badge
const StatusBadge = ({ status }) => {
  const styles = {
    Replied: 'bg-green-100 text-green-800',
    Unread: 'bg-yellow-100 text-yellow-800',
    Archived: 'bg-gray-100 text-gray-800',
    Spam: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

// A dedicated form component for sending new messages
const NewMessageForm = ({ onMessageSent }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const { showNotification } = useNotification();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !body.trim()) {
      showNotification('Subject and message body are required.', 'error');
      return;
    }
    setIsSending(true);
    try {
      await api.post('/customer-dashboard/messages', { subject, body });
      showNotification('Message sent successfully!', 'success');
      setSubject('');
      setBody('');
      if (onMessageSent) {
        onMessageSent();
      }
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to send message.', 'error');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="subject" className="block text-sm font-medium text-gray-700">Subject</label>
        <input
          type="text"
          id="subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="How can we help?"
          required
        />
      </div>
      <div>
        <label htmlFor="body" className="block text-sm font-medium text-gray-700">Message</label>
        <textarea
          id="body"
          rows="5"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
          placeholder="Write your message here..."
          required
        ></textarea>
      </div>
      <div className="text-right">
        <button
          type="submit"
          disabled={isSending}
          className="bg-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center ml-auto disabled:bg-primary/70"
        >
          {isSending ? <FaSpinner className="animate-spin mr-2" /> : <FaPaperPlane className="mr-2" />}
          Send Message
        </button>
      </div>
    </form>
  );
};

const CustomerMessages = () => {
  const { user } = useContext(AuthContext);
  const { showNotification } = useNotification();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState(null);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customer-dashboard/messages');
      setMessages(res.data.data.messages);
    } catch (err) {
      showNotification('Failed to fetch messages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchMessages();
    }
  }, [user]);

  const handleSelectMessage = (message) => {
    setSelectedMessage(message);
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message thread?')) {
      try {
        await api.delete(`/customer-dashboard/messages/${messageId}`);
        showNotification('Message deleted successfully!', 'success');
        setSelectedMessage(null); // Clear the view
        fetchMessages(); // Refresh the list
      } catch (err) {
        const errorMessage = err.response?.data?.message || 'Failed to delete message.';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleNewMessageClick = () => {
    setSelectedMessage(null); // Deselect any message to show the new message form
  };

  if (loading && messages.length === 0) {
    return <div className="flex justify-center items-center h-full"><FaSpinner className="animate-spin text-4xl text-primary" /></div>;
  }

  return (
    <div className="bg-gray-50 p-4 md:p-8 min-h-full">
      <h1 className="text-3xl font-bold text-primary mb-8">My Messages</h1>

      <div className="bg-white rounded-2xl shadow-md flex flex-col md:flex-row h-[calc(100vh-180px)]">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 lg:w-1/4 border-r border-gray-200 bg-white">
          <div className="p-4 border-b">
            <button
              onClick={handleNewMessageClick}
              className="w-full bg-primary text-white font-bold py-3 px-4 rounded-lg hover:bg-opacity-90 transition-colors flex items-center justify-center"
            >
              <FaPlus className="mr-2" /> New Message
            </button>
            <h2 className="text-xl font-bold text-primary mt-4">Inbox</h2>
          </div>
          <div className="overflow-y-auto h-[calc(100vh-280px)]">
            {messages.length === 0 && !loading && (
              <div className="p-4 text-center text-gray-500">No messages yet.</div>
            )}
            {messages.map((message) => (
              <div
                key={message._id}
                onClick={() => handleSelectMessage(message)}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${selectedMessage?._id === message._id ? 'bg-primary/10' : ''}`}
              >
                <div className="flex justify-between items-start">
                  <p className={`font-semibold truncate ${message.status === 'Unread' ? 'text-primary' : 'text-gray-800'}`}>{message.subject}</p>
                  <StatusBadge status={message.status} />
                </div>
                <p className="text-sm text-gray-600 truncate mt-1">{message.body}</p>
                <p className="text-xs text-gray-400 text-right mt-2">{formatDistanceToNow(parseISO(message.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {selectedMessage ? (
            <motion.div key={selectedMessage._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="flex justify-between items-start pb-4 border-b">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">{selectedMessage.subject}</h2>
                  <p className="text-sm text-gray-500">
                    Sent on {format(parseISO(selectedMessage.createdAt), 'MMM d, yyyy, h:mm a')}
                  </p>
                </div>
                <button onClick={() => handleDeleteMessage(selectedMessage._id)} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors" title="Delete Message">
                  <FaTrash />
                </button>
              </div>

              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap mt-6">
                {selectedMessage.body}
              </p>

              {selectedMessage.reply && (
                <div className="bg-gray-100 p-4 rounded-lg mt-6">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-bold text-primary">Reply from BongoExpress</p>
                    <p className="text-xs text-gray-500">{format(parseISO(selectedMessage.updatedAt), 'MMM d, yyyy, h:mm a')}</p>
                  </div>
                  <p className="text-gray-600 whitespace-pre-wrap">{selectedMessage.reply}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-primary mb-6">Compose New Message</h2>
              <NewMessageForm onMessageSent={fetchMessages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CustomerMessages;
