import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import axios from 'axios';
import { FaShippingFast, FaUsers, FaDollarSign, FaCheckCircle } from 'react-icons/fa';
import {
  ResponsiveContainer,
  AreaChart,
  XAxis,
  YAxis,
  Tooltip,
  Area,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from 'recharts';

const MetricCard = ({ icon, title, value }) => {
  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-md flex flex-col items-center text-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
      whileHover={{ scale: 1.03 }}
    >
      <div className="bg-accent/20 text-accent p-4 rounded-full">
        {icon}
      </div>
      <div className="mt-4">
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-2xl font-bold text-primary">{value}</p>
      </div>
    </motion.div>
  );
};

const DashboardOverview = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await axios.get('/api/dashboard/stats');
        setStats(response.data.data);
        setError('');
      } catch (err) {
        setError('Failed to fetch dashboard data. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return <div className="text-center p-10">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  const metrics = [
    {
      icon: <FaShippingFast size={24} />,
      title: 'Total Shipments',
      value: stats?.metrics?.totalShipments || 0,
    },
    {
      icon: <FaUsers size={24} />,
      title: 'Total Customers',
      value: stats?.metrics?.totalCustomers || 0,
    },
    {
      icon: <FaDollarSign size={24} />,
      title: 'Total Revenue',
      value: `$${(stats?.metrics?.totalRevenue || 0).toLocaleString()}`,
    },
    {
      icon: <FaCheckCircle size={24} />,
      title: 'Delivery Success',
      value: `${(stats?.metrics?.deliverySuccessRate || 0).toFixed(1)}%`,
    },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <MetricCard {...metric} />
          </motion.div>
        ))}
      </div>

      {/* Charts and Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        <motion.div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <h3 className="text-lg font-semibold text-primary mb-4">Shipments Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={stats?.charts?.shipmentData || []}>
              <defs>
                <linearGradient id="colorShipments" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
              <YAxis tick={{ fill: '#6b7280' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  backdropFilter: 'blur(5px)',
                  border: '1px solid #e0e0e0',
                  borderRadius: '0.5rem',
                }}
              />
              <Area type="monotone" dataKey="shipments" stroke="#FBBF24" fillOpacity={1} fill="url(#colorShipments)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div className="bg-white p-6 rounded-lg shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3 className="text-lg font-semibold text-primary mb-4">Recent Activity</h3>
          <ul className="space-y-4">
            {(stats?.recentActivities || []).map(activity => (
              <li key={activity.id} className="flex items-start">
                <div className={`bg-accent/20 text-accent rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center`}>
                  {activity.type === 'shipment' ? (
                    <FaShippingFast size={16} />
                  ) : (
                    <FaUsers size={16} />
                  )}
                </div>
                <div className="ml-3">
                  <p className="text-sm text-gray-600">{activity.text}</p>
                  <p className="text-xs text-gray-400">
                    {activity.timestamp ? `${formatDistanceToNow(new Date(activity.timestamp))} ago` : 'just now'}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>

      <motion.div className="mt-8 bg-white p-6 rounded-lg shadow-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <h3 className="text-lg font-semibold text-primary mb-4">Revenue vs. Expenses</h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={stats?.charts?.revenueData || []}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
            <YAxis tickFormatter={(value) => `$${value / 1000}k`} tick={{ fill: '#6b7280' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(5px)',
                border: '1px solid #e0e0e0',
                borderRadius: '0.5rem',
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#0B1D3A" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expenses" fill="#FBBF24" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </motion.div>
  );
};

export default DashboardOverview;