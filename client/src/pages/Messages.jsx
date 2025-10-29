import React, { useState, useEffect } from 'react';
import { FaEnvelope, FaEnvelopeOpen, FaReply, FaTrash, FaSearch, FaPaperPlane, FaFilter } from 'react-icons/fa';
import { format, formatDistanceToNow } from 'date-fns';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import api from '../api/axios';
import { useNotification } from '../context/NotificationContext';

const StatCard = ({ title, value, icon, color }) => (
  <div className={`p-6 rounded-2xl shadow-md flex flex-col items-center text-center ${color}`}>
    <div className="p-3 rounded-full bg-white mb-3">{icon}</div>
    <div className="w-full">
      <p className="text-sm font-medium text-gray-600">{title}</p>
      <p className="text-2xl font-bold text-primary truncate">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => {
  const styles = {
    Unread: 'bg-yellow-100 text-yellow-800',
    Replied: 'bg-green-100 text-green-800',
    Spam: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

const Messages = () => {
  const [messages, setMessages] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState('');
  const { showNotification } = useNotification();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [messagesRes, summaryRes] = await Promise.all([
        api.get(`/messages?page=${currentPage}&limit=10&search=${searchTerm}&status=${statusFilter}`),
        api.get('/messages/summary'),
      ]);
      const fetchedMessages = messagesRes.data.data.messages;
      setMessages(fetchedMessages);
      setPagination(messagesRes.data.data.pagination);
      setSummary(summaryRes.data.data);

      if (fetchedMessages.length > 0 && !selectedMessage) {
        handleSelectMessage(fetchedMessages[0]);
      } else if (fetchedMessages.length === 0) {
        setSelectedMessage(null);
      }
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch messages.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const updateMessageStatus = async (messageId, newStatus) => {
    try {
      await api.put(`/messages/${messageId}`, { status: newStatus }); // Endpoint might be different, e.g., /messages/:id/status
      showNotification(`Message marked as ${newStatus}.`, 'success');
      fetchData();
    } catch (err) {
      showNotification('Failed to update message status.', 'error');
      console.error(err);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        await api.delete(`/messages/${messageId}`);
        showNotification('Message deleted successfully.', 'success');
        setSelectedMessage(null);
        fetchData();
      } catch (err) {
        showNotification('Failed to delete message.', 'error');
        console.error(err);
      }
    }
  };

  const handleSelectMessage = async (message) => {
    setSelectedMessage(message);
  };

  const handleReplySubmit = async () => {
    if (!selectedMessage || !replyText.trim()) {
      showNotification('Reply cannot be empty.', 'error');
      return;
    }
    try {
      await api.post(`/messages/${selectedMessage._id}/reply`, { replyBody: replyText });
      showNotification('Reply sent successfully!', 'success');
      setReplyText(''); // Clear the textarea
      // Refetch data to update the message status in the list
      fetchData();
    } catch (err) {
      showNotification('Failed to send reply.', 'error');
      console.error(err);
    }
  };

  const fromResult = pagination.total > 0 ? (currentPage - 1) * pagination.limit + 1 : 0;
  const toResult = fromResult + messages.length - 1;

  return (
    <div className="bg-gray-50 p-4 md:p-8 min-h-full">
      {/* 1. Header Section */}
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-primary">Customer Messages</h1>
        <div className="relative">
          <FaSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 pl-12 w-full md:w-72 focus:ring-2 focus:ring-yellow-400 outline-none"
          />
        </div>
      </div>

      {/* 2. Message Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Messages" value={summary.totalMessages || 0} icon={<FaEnvelope size={24} className="text-blue-500" />} color="bg-blue-50" />
        <StatCard title="Unread" value={summary.unreadMessages || 0} icon={<FaEnvelopeOpen size={24} className="text-yellow-500" />} color="bg-yellow-50" />
        <StatCard title="Replied" value={summary.repliedMessages || 0} icon={<FaReply size={24} className="text-green-500" />} color="bg-green-50" />
        <StatCard title="Spam" value={summary.spamMessages || 0} icon={<FaTrash size={24} className="text-red-500" />} color="bg-red-50" />
      </div>

      {/* Main Content: List and View Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 3. Messages List */}
        <div className="lg:col-span-1 bg-white p-6 rounded-2xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-primary">Inbox</h3>
            <div className="flex items-center gap-2">
              <FaFilter className="text-gray-400" />
              <select onChange={(e) => setStatusFilter(e.target.value)} value={statusFilter} className="border-none bg-transparent text-sm font-medium focus:ring-0">
                <option>All</option>
                <option>Unread</option>
                <option>Replied</option>
                <option>Spam</option>
              </select>
            </div>
          </div>
          <div className="space-y-2">
            {loading && <p className="text-center text-gray-500">Loading messages...</p>}
            {!loading && messages.length === 0 && <p className="text-center text-gray-500">No messages found.</p>}
            {!loading && messages.map(message => (
              <div
                key={message._id}
                onClick={() => handleSelectMessage(message)}
                className={`p-4 rounded-lg cursor-pointer transition-colors ${selectedMessage?._id === message._id ? 'bg-primary/10' : 'hover:bg-gray-50'}`}
              >
                <div className="flex justify-between items-start">
                  <p className={`font-bold ${message.status === 'Unread' ? 'text-primary' : 'text-gray-800'}`}>{message.sender}</p>
                  <StatusBadge status={message.status} />
                </div>
                <p className="text-sm text-gray-600 truncate">{message.subject}</p>
                <p className="text-xs text-gray-400 mt-1">{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</p>
              </div>
            ))}
          </div>
          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <p className="text-sm text-gray-500">
              Showing {fromResult} to {toResult} of {pagination.total} results
            </p>
            <div className="flex items-center">
              <button
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronLeft />
              </button>
              <span className="px-4 py-2 text-sm font-medium bg-accent/20 text-accent rounded-md">{currentPage}</span>
              <button
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === pagination.totalPages}
                className="p-2 rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* 4. Message View Panel */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-md">
          {selectedMessage ? (
            <div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">{selectedMessage.subject}</h2>
              <div className="flex justify-between items-center text-sm text-gray-500 mb-6 pb-4 border-b">
                <div>
                  <p>From: <span className="font-medium text-primary">{selectedMessage.sender}</span> ({selectedMessage.email})</p>
                </div>
                <p>{format(new Date(selectedMessage.createdAt), 'MMM dd, yyyy, h:mm a')}</p>
              </div>
              <p className="text-gray-700 leading-relaxed mb-8 whitespace-pre-wrap">
                {selectedMessage.body}
              </p>

              {/* Quick Reply Form */}
              <div>
                <h3 className="text-lg font-semibold text-primary mb-3">Quick Reply</h3>
                <textarea
                  placeholder="Write a reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows="4"
                  className="w-full border rounded-lg px-4 py-3 mb-4 focus:ring-2 focus:ring-yellow-400 outline-none transition"
                ></textarea>
                <div className="flex justify-end gap-3">
                  <button onClick={() => updateMessageStatus(selectedMessage._id, 'Spam')} className="bg-gray-200 text-gray-800 px-5 py-2 rounded-lg font-semibold hover:bg-gray-300 transition">
                    Mark as Spam
                  </button>
                  <button onClick={handleReplySubmit} className="bg-accent text-primary px-5 py-2 rounded-lg font-bold hover:bg-yellow-400 transition flex items-center">
                    <FaPaperPlane className="mr-2" /> Send Reply
                  </button>
                  <button onClick={() => handleDeleteMessage(selectedMessage._id)} className="bg-red-500 text-white px-5 py-2 rounded-lg font-bold hover:bg-red-600 transition flex items-center">
                    <FaTrash className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FaEnvelopeOpen size={60} />
              <p className="mt-4 text-lg">Select a message to read</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;