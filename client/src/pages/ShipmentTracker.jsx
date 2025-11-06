import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowLeft, FaBox, FaCheckCircle, FaTruck, FaMapMarkerAlt } from 'react-icons/fa';
import { format } from 'date-fns';
import api from '../api/axios';

const statusIcons = {
  Pending: <FaBox className="text-yellow-500" />,
  'In Transit': <FaTruck className="text-blue-500" />,
  Delivered: <FaCheckCircle className="text-green-500" />,
  Delayed: <FaCheckCircle className="text-orange-500" />,
  Cancelled: <FaCheckCircle className="text-red-500" />,
};

const ShipmentTracker = () => {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchShipment = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/customer-dashboard/shipments/${id}`);
        setShipment(res.data.data.shipment);
      } catch (err) {
        setError('Failed to fetch shipment details. Please try again.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchShipment();
  }, [id]);

  if (loading) {
    return <div className="text-center p-10">Loading tracking details...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  if (!shipment) {
    return <div className="text-center p-10">Shipment not found.</div>;
  }

  // Sort history from newest to oldest
  const sortedHistory = [...(shipment.trackingHistory || [])].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-6 rounded-xl shadow-soft-lg">
      <div className="flex items-center mb-6">
        <Link to="/customer/dashboard/shipments" className="text-primary hover:text-accent mr-4">
          <FaArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-primary">Tracking Details</h1>
          <p className="text-gray-500">Tracking Number: {shipment.shipmentId}</p>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-sm text-gray-500">Origin</p>
            <p className="font-semibold text-primary">{shipment.origin}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Current Status</p>
            <p className="font-bold text-lg text-accent">{shipment.status}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Destination</p>
            <p className="font-semibold text-primary">{shipment.destination}</p>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-primary mb-4">Shipment History</h3>
        <div className="relative pl-4 border-l-2 border-gray-200">
          {sortedHistory.map((entry, index) => (
            <div key={entry._id} className="mb-8 flex items-start">
              <div className="absolute -left-4 top-1 bg-white p-1 rounded-full border-2 border-gray-200">
                {statusIcons[entry.status] || <FaMapMarkerAlt />}
              </div>
              <div className="ml-4">
                <p className="font-semibold text-gray-800">{entry.status}</p>
                <p className="text-sm text-gray-600">{entry.location}</p>
                <p className="text-xs text-gray-400 mt-1">{format(new Date(entry.timestamp), 'MMM dd, yyyy, h:mm a')}</p>
              </div>
            </div>
          ))}
          {sortedHistory.length === 0 && (
            <p className="text-gray-500">No tracking history available yet.</p>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ShipmentTracker;