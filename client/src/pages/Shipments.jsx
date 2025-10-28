import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPlus, FaSearch, FaTruck, FaCheckCircle, FaExclamationTriangle, FaTimesCircle, FaBoxOpen } from 'react-icons/fa';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import axios from 'axios';
import { format } from 'date-fns';

const statusStyles = {
  Delivered: 'bg-green-100 text-green-700',
  'In Transit': 'bg-blue-100 text-blue-700',
  Pending: 'bg-yellow-100 text-yellow-700',
  Delayed: 'bg-orange-100 text-orange-700',
  Cancelled: 'bg-red-100 text-red-700',
};

const StatCard = ({ title, value, icon, color }) => (
  <div className={`bg-white p-4 rounded-lg shadow-md flex flex-col items-center ${color}`}>
    <div className="p-3 rounded-full bg-white mb-2">{icon}</div>
    <div className="text-center">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <p className="text-2xl font-bold text-primary">{value}</p>
    </div>
  </div>
);

const StatusBadge = ({ status }) => (
  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${statusStyles[status] || 'bg-gray-100 text-gray-700'}`}>
    {status}
  </span>
);

const Shipments = () => {
  const [shipments, setShipments] = useState([]);
  const [summary, setSummary] = useState({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const initialFormState = {
    customerName: '',
    origin: '',
    destination: '',
    weight: '',
    packageDetails: '',
    status: 'Pending',
  };
  const [currentShipment, setCurrentShipment] = useState(initialFormState);
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 10;
  const [editingShipment, setEditingShipment] = useState(null);

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsRes, summaryRes] = await Promise.all([
        axios.get(`/api/shipments?page=${currentPage}&limit=${limit}`),
        axios.get('/api/shipments/summary'),
      ]);
      setShipments(shipmentsRes.data.data.shipments);
      setPagination(shipmentsRes.data.data.pagination);
      setSummary(summaryRes.data.data);
      setError('');
    } catch (err) {
      setError('Failed to fetch shipment data.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentPage]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (editingShipment) {
      // Update existing shipment
      await axios.put(`/api/shipments/${editingShipment._id}`, currentShipment);
    } else {
      // Create new shipment
      await axios.post('/api/shipments', currentShipment);
    }
    setIsModalOpen(false);
    setEditingShipment(null);
    if (currentPage !== 1 && !editingShipment) {
      setCurrentPage(1);
    } else {
      fetchData(); // Refetch data
    }
  };

  const openCreateModal = () => {
    setEditingShipment(null);
    setCurrentShipment(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (shipment) => {
    setEditingShipment(shipment);
    setCurrentShipment({
      customerName: shipment.customer?.name || '',
      origin: shipment.origin,
      destination: shipment.destination,
      weight: shipment.weight,
      packageDetails: shipment.packageDetails,
      status: shipment.status,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (shipmentId) => {
    if (window.confirm('Are you sure you want to delete this shipment?')) {
      await axios.delete(`/api/shipments/${shipmentId}`);
      fetchData(); // Refetch data
    }
  };

  const fromResult = (pagination.page - 1) * pagination.limit + 1;
  const toResult = fromResult + shipments.length - 1;

  return (
    <div>
      {/* 1. Page Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-primary">Shipments Management</h1>
          <p className="text-gray-500 mt-1">View, update, and track all shipment activities.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-accent text-primary font-bold py-2 px-4 rounded-lg flex items-center hover:bg-yellow-400 transition-colors"
        >
          <FaPlus className="mr-2" /> New Shipment
        </button>
      </div>

      {/* 2. Shipment Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <StatCard title="Total Shipments" value={summary.totalShipments || 0} icon={<FaBoxOpen size={24} className="text-gray-500" />} color="bg-gray-50" />
        <StatCard title="In Transit" value={summary.inTransit || 0} icon={<FaTruck size={24} className="text-blue-500" />} color="bg-blue-50" />
        <StatCard title="Delivered" value={summary.delivered || 0} icon={<FaCheckCircle size={24} className="text-green-500" />} color="bg-green-50" />
        <StatCard title="Pending/Delayed" value={summary.pending || 0} icon={<FaExclamationTriangle size={24} className="text-yellow-500" />} color="bg-yellow-50" />
        <StatCard title="Cancelled" value={summary.cancelled || 0} icon={<FaTimesCircle size={24} className="text-red-500" />} color="bg-red-50" />
      </div>

      {/* 3. Shipment Table */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-primary">All Shipments</h3>
          <div className="relative">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by customer or ID..."
              className="bg-gray-100 focus:bg-white focus:ring-2 focus:ring-primary border border-gray-200 rounded-full py-2 pl-10 pr-4 transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="p-3 text-sm font-semibold text-gray-600">Shipment ID</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Customer</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Origin</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Destination</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Status</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Date</th>
                <th className="p-3 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && <tr><td colSpan="7" className="text-center p-4">Loading...</td></tr>}
              {error && <tr><td colSpan="7" className="text-center p-4 text-red-500">{error}</td></tr>}
              {!loading && !error && shipments.map((shipment) => (
                <tr key={shipment._id} className="border-b hover:bg-gray-50">
                  <td className="p-3 text-sm font-medium text-primary">{shipment.shipmentId}</td>
                  <td className="p-3 text-sm text-gray-700">{shipment.customer?.name || 'N/A'}</td>
                  <td className="p-3 text-sm text-gray-700">{shipment.origin}</td>
                  <td className="p-3 text-sm text-gray-700">{shipment.destination}</td>
                  <td className="p-3 text-sm"><StatusBadge status={shipment.status} /></td>
                  <td className="p-3 text-sm text-gray-500">{format(new Date(shipment.dispatchDate), 'MMM dd, yyyy')}</td>
                  <td className="p-3 text-sm">
                    <div className="flex space-x-2">
                      <button onClick={() => openEditModal(shipment)} className="text-blue-500 hover:text-blue-700">View</button>
                      <button onClick={() => openEditModal(shipment)} className="text-green-500 hover:text-green-700">Edit</button>
                      <button onClick={() => handleDelete(shipment._id)} className="text-red-500 hover:text-red-700">Delete</button>
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

      {/* 5. Add/Edit Shipment Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              className="bg-white rounded-lg shadow-2xl w-full max-w-2xl"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <div className="p-6 border-b">
                <h2 className="text-xl font-bold text-primary">{editingShipment ? 'Edit' : 'Create New'} Shipment</h2>
              </div>
              <form className="p-6" onSubmit={handleFormSubmit}>
                <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Customer Name</label>
                  <input type="text" value={currentShipment.customerName} onChange={(e) => setCurrentShipment({ ...currentShipment, customerName: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., John Doe" required disabled={!!editingShipment} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Origin</label>
                    <input type="text" value={currentShipment.origin} onChange={(e) => setCurrentShipment({ ...currentShipment, origin: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., Mombasa" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destination</label>
                    <input type="text" value={currentShipment.destination} onChange={(e) => setCurrentShipment({ ...currentShipment, destination: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., Nairobi" required />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div>
                    <label className="block text-sm font-medium text-gray-700">Weight (kg)</label>
                    <input type="number" value={currentShipment.weight} onChange={(e) => setCurrentShipment({ ...currentShipment, weight: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" placeholder="e.g., 25" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <select value={currentShipment.status} onChange={(e) => setCurrentShipment({ ...currentShipment, status: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary">
                      <option>Pending</option>
                      <option>In Transit</option>
                      <option>Delivered</option>
                      <option>Delayed</option>
                      <option>Cancelled</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package Details</label>
                  <textarea value={currentShipment.packageDetails} onChange={(e) => setCurrentShipment({ ...currentShipment, packageDetails: e.target.value })} className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" rows="3" placeholder="e.g., 1 box of electronics"></textarea>
                </div>
                </div>
                <div className="mt-6 pt-4 border-t flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="bg-gray-200 text-gray-700 font-bold py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white font-bold py-2 px-4 rounded-lg hover:bg-opacity-90 transition-colors"
                  >
                    {editingShipment ? 'Save Changes' : 'Create Shipment'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Shipments;