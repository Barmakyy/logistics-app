import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaUsers, FaTruckLoading, FaUserClock, FaUserTimes, FaStar } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight, FiDownload } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
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
    Active: 'bg-green-100 text-green-800',
    Idle: 'bg-yellow-100 text-yellow-800',
    Inactive: 'bg-red-100 text-red-800',
  };
  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-700'}`}>
      {status}
    </span>
  );
};

const RegionBadge = ({ region }) => {
    const styles = {
      Mombasa: 'bg-blue-100 text-blue-800',
      Nairobi: 'bg-green-100 text-green-800',
      Kisumu: 'bg-purple-100 text-purple-800',
    };
    return (
      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${styles[region] || 'bg-gray-100 text-gray-800'}`}>
        {region}
      </span>
    );
  };

const Agents = () => {
  const [agents, setAgents] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All');
  const [regionFilter, setRegionFilter] = useState('All Regions');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [newAgent, setNewAgent] = useState({ name: '', email: '', password: '', phone: '', location: 'Mombasa' });
  const { showNotification } = useNotification();

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
  };

  const fetchData = async () => {
    // Only fetch summary on the first page load to avoid refetching on pagination
    const shouldFetchSummary = currentPage === 1 && !Object.keys(summary).length;

    try {
      setLoading(true);
      const [agentsRes, summaryRes] = await Promise.all([
        api.get(`/agents?page=${currentPage}&limit=10&search=${searchTerm}&status=${filter}&region=${regionFilter}`),
        api.get('/agents/summary'),
      ]);
      setAgents(agentsRes.data.data.agents);
      setPagination(agentsRes.data.data.pagination);
      if (shouldFetchSummary) setSummary(summaryRes.data.data);
    } catch (err) {
      console.error(err);
      showNotification('Failed to fetch agent data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (currentPage !== 1) setCurrentPage(1);
      else fetchData();
    }, 300); // Debounce search/filter
    return () => clearTimeout(timer);
  }, [searchTerm, filter, regionFilter]);

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleExport = () => {
    if (!agents.length) {
      showNotification('No agent data to export.', 'error');
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Region', 'Total Deliveries', 'Status', 'Rating'];
    const csvRows = [
      headers.join(','),
      ...agents.map(agent => [
        `"${agent.name}"`,
        `"${agent.email}"`,
        `"${agent.phone || 'N/A'}"`,
        `"${agent.location || 'N/A'}"`,
        agent.deliveries,
        agent.status,
        agent.rating
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agents.csv';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Agent data exported successfully!', 'success');
  };

  const openAddModal = () => {
    setNewAgent({ name: '', email: '', password: '', phone: '', location: 'Mombasa' });
    setIsAddModalOpen(true);
  };

  const closeAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleAddFormSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/agents', newAgent);
      closeAddModal();
      showNotification('Agent added successfully!', 'success');
      fetchData(); // Refetch to show the new agent
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to add agent.';
      showNotification(message, 'error');
    }
  };

  const openEditModal = (agent) => {
    setSelectedAgent({ ...agent });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedAgent(null);
  };

  const handleEditFormSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAgent) return;
    try {
      await api.put(`/agents/${selectedAgent._id}`, selectedAgent);
      closeEditModal();
      showNotification('Agent updated successfully!', 'success');
      fetchData();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to update agent.';
      showNotification(message, 'error');
    }
  };

  const handleDelete = async (agentId) => {
    if (window.confirm('Are you sure you want to delete this agent?')) {
      try {
        await api.delete(`/agents/${agentId}`);
        showNotification('Agent deleted successfully.', 'success');
        fetchData();
      } catch (err) {
        showNotification('Failed to delete agent.', 'error');
      }
    }
  };

  const openViewModal = (agent) => {
    setSelectedAgent(agent);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    setIsViewModalOpen(false);
    setSelectedAgent(null);
  };

  const fromResult = (pagination.page - 1) * pagination.limit + 1;
  const toResult = fromResult + agents.length - 1;

  return (
    <div>
      {/* 1. Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Agents Management</h1>
          <p className="text-gray-500 mt-1">Register, assign, and track all field agents.</p>
        </div>
        <button onClick={openAddModal} className="bg-accent text-primary font-bold py-2 px-6 rounded-lg flex items-center hover:bg-yellow-400 transition-colors">
          <FaPlus className="mr-2" /> Add Agent
        </button>
      </div>

      {/* 2. Quick Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Total Agents" value={summary.totalAgents || 0} icon={<FaUsers size={24} className="text-blue-500" />} color="bg-blue-50" />
        <StatCard title="Active on Delivery" value={summary.activeOnDelivery || 0} icon={<FaTruckLoading size={24} className="text-green-500" />} color="bg-green-50" />
        <StatCard title="Available / Idle" value={summary.availableIdle || 0} icon={<FaUserClock size={24} className="text-yellow-500" />} color="bg-yellow-50" />
        <StatCard title="Inactive / Off Duty" value={summary.inactiveOffDuty || 0} icon={<FaUserTimes size={24} className="text-red-500" />} color="bg-red-50" />
      </div>

      {/* 3. Agents Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold text-primary">All Agents</h3>
            <div className="relative">
              <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or region..."
                className="bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary border border-gray-200 rounded-full py-2 pl-10 pr-4 transition-all w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
             <select
                className="bg-gray-100 border border-gray-200 rounded-md py-2 px-3 text-sm"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
              <option>All</option>
              <option>Active</option>
              <option>Idle</option>
              <option>Inactive</option>
            </select>
             <select 
                className="bg-gray-100 border border-gray-200 rounded-md py-2 px-3 text-sm"
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
              >
              <option>All Regions</option>
              <option>Mombasa</option>
              <option>Nairobi</option>
              <option>Kisumu</option>
            </select>
            <button onClick={handleExport} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md flex items-center hover:bg-gray-200 transition text-sm">
              <FiDownload className="mr-2" /> Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Name</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Contact</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Region</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Total Deliveries</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600 text-center">Rating</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>}
              {!loading && agents.map((agent) => (
                <tr key={agent._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium text-primary">{agent.name}</td>
                  <td className="p-3 text-sm text-gray-500">{agent.phone || 'N/A'}</td>
                  <td className="p-3 text-sm"><RegionBadge region={agent.location || 'N/A'} /></td>
                  <td className="p-3 text-sm text-gray-700 text-center">{agent.deliveries}</td>
                  <td className="p-3 text-sm"><StatusBadge status={agent.status} /></td>
                  <td className="p-3 text-sm text-gray-700">
                    <div className="flex items-center justify-center">
                      <FaStar className="text-yellow-400 mr-1" /> {agent.rating.toFixed(1)}
                    </div>
                  </td>
                  <td className="p-3 text-sm">
                    <div className="flex space-x-3">
                      <button onClick={() => openViewModal(agent)} className="text-blue-500 hover:text-blue-700" title="View Details">View</button>
                      <button onClick={() => openEditModal(agent)} className="text-green-500 hover:text-green-700" title="Edit Agent">Edit</button>
                      <button onClick={() => handleDelete(agent._id)} className="text-red-500 hover:text-red-700" title="Delete Agent">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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

      {/* Add Agent Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-primary">Add New Agent</h2>
              </div>
              <form className="p-6" onSubmit={handleAddFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label><input type="text" value={newAgent.name} onChange={(e) => setNewAgent({ ...newAgent, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label><input type="email" value={newAgent.email} onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input type="text" value={newAgent.phone} onChange={(e) => setNewAgent({ ...newAgent, phone: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                      <select value={newAgent.location} onChange={(e) => setNewAgent({ ...newAgent, location: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <option>Mombasa</option>
                        <option>Nairobi</option>
                        <option>Kisumu</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                  <button type="button" onClick={closeAddModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                    Add Agent
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Agent Modal */}
      <AnimatePresence>
        {isEditModalOpen && selectedAgent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-primary">Edit Agent</h2>
              </div>
              <form className="p-6" onSubmit={handleEditFormSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Full Name</label>
                    <input type="text" value={selectedAgent.name} onChange={(e) => setSelectedAgent({ ...selectedAgent, name: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <input type="email" value={selectedAgent.email} onChange={(e) => setSelectedAgent({ ...selectedAgent, email: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Phone</label>
                      <input type="text" value={selectedAgent.phone || ''} onChange={(e) => setSelectedAgent({ ...selectedAgent, phone: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Region</label>
                      <select value={selectedAgent.location} onChange={(e) => setSelectedAgent({ ...selectedAgent, location: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                        <option>Mombasa</option>
                        <option>Nairobi</option>
                        <option>Kisumu</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={selectedAgent.status} onChange={(e) => setSelectedAgent({ ...selectedAgent, status: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                      <option>Active</option>
                      <option>Idle</option>
                      <option>Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                  <button type="button" onClick={closeEditModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors">
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {isViewModalOpen && selectedAgent && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-lg"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
            >
              <div className="p-6 border-b flex justify-between items-center">
                <h2 className="text-xl font-bold text-primary">Agent Details</h2>
                <StatusBadge status={selectedAgent.status} />
              </div>
              <div className="p-6 space-y-4">
                <div className="text-center">
                  <h3 className="text-2xl font-bold">{selectedAgent.name}</h3>
                  <p className="text-gray-500">{selectedAgent.email}</p>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm pt-4 border-t">
                  <p><strong className="text-gray-500 block">Phone:</strong> {selectedAgent.phone || 'N/A'}</p>
                  <p><strong className="text-gray-500 block">Region:</strong> {selectedAgent.location || 'N/A'}</p>
                  <p><strong className="text-gray-500 block">Total Deliveries:</strong> {selectedAgent.deliveries}</p>
                  <p><strong className="text-gray-500 block">Rating:</strong> {selectedAgent.rating.toFixed(1)} / 5.0</p>
                </div>
              </div>
              <div className="p-4 bg-gray-50 flex justify-end rounded-b-lg">
                <button onClick={closeViewModal} className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors">
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Agents;