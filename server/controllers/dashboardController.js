import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';

export const getStats = async (req, res) => {
  try {
    // 1. Metric Cards Data
    const totalShipments = await Shipment.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const revenueResult = await Shipment.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalRevenue: { $sum: '$cost' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const deliveredResult = await Shipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] },
          },
        },
      },
    ]);
    const deliverySuccessRate =
      deliveredResult[0]?.total > 0
        ? (deliveredResult[0].delivered / deliveredResult[0].total) * 100
        : 0;

    // 2. Shipments Chart Data (last 6 months)
    const sixMonthsAgo = subMonths(new Date(), 5);
    const firstDayOfPeriod = startOfMonth(sixMonthsAgo);

    const shipmentCounts = await Shipment.aggregate([
      { $match: { createdAt: { $gte: firstDayOfPeriod } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for recharts
    const shipmentData = shipmentCounts.map(item => ({
        name: format(new Date(item._id), 'MMM'),
        shipments: item.count
    }));

    // 3. Revenue & Expenses Chart Data (last 6 months)
    const revenueAndExpenses = await Shipment.aggregate([
      { $match: { createdAt: { $gte: firstDayOfPeriod }, status: 'delivered' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          revenue: { $sum: '$cost' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Format for recharts and add dummy expenses
    const revenueData = revenueAndExpenses.map(item => ({
        name: format(new Date(item._id), 'MMM'),
        revenue: item.revenue,
        // Generating dummy expenses as 60% of revenue for demonstration
        expenses: Math.floor(item.revenue * 0.6),
    }));

    // 4. Recent Activities
    const recentShipments = await Shipment.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .populate('customer', 'name');

    const recentCustomers = await User.find({ role: 'customer' })
      .sort({ createdAt: -1 })
      .limit(2);

    const activities = [
      ...recentShipments.map(s => ({
        id: s._id,
        type: 'shipment',
        text: `New shipment created for ${s.customer?.name || 'a customer'}.`,
        timestamp: s.createdAt,
      })),
      ...recentCustomers.map(c => ({
        id: c._id,
        type: 'customer',
        text: `New customer registered: ${c.name}.`,
        timestamp: c.createdAt,
      })),
    ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 4);

    res.status(200).json({
      status: 'success',
      data: {
        metrics: {
          totalShipments,
          totalCustomers,
          totalRevenue,
          deliverySuccessRate,
        },
        charts: {
          shipmentData,
          revenueData,
        },
        recentActivities: activities,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch dashboard stats.',
      error: error.message,
    });
  }
};