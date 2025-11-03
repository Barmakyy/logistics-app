import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import Payment from '../models/Payment.js';
import { startOfMonth, endOfMonth, subMonths, format, addMinutes } from 'date-fns';

export const getStats = async (req, res) => {
  try {
    // 1. Metric Cards Data
    const totalShipments = await Shipment.countDocuments();
    const totalCustomers = await User.countDocuments({ role: 'customer' });

    const revenueResult = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    const deliveredResult = await Shipment.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          delivered: {
            $sum: { $cond: [{ $eq: ['$status', 'Delivered'] }, 1, 0] },
          },
        },
      },
    ]);
    const deliverySuccessRate =
      deliveredResult[0]?.total > 0
        ? (deliveredResult[0].delivered / deliveredResult[0].total) * 100
        : 0;

    // 2. Shipments Chart Data (last 6 months)
    const now = new Date();
    // To avoid timezone issues, we work with UTC dates
    const utcNow = addMinutes(now, now.getTimezoneOffset());
    const sixMonthsAgo = subMonths(utcNow, 5);
    const firstDayOfPeriod = startOfMonth(sixMonthsAgo);


    const shipmentCounts = await Shipment.aggregate([
      { $match: { createdAt: { $gte: firstDayOfPeriod } } }, // Filter for the last 6 months
      {
        $group: {
          _id: {
            month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
            status: '$status',
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: '$_id.month',
          statuses: { $push: { status: '$_id.status', count: '$count' } },
        },
      },
      {
        $addFields: {
          statuses: {
            $arrayToObject: {
              $map: {
                input: '$statuses',
                as: 's',
                in: { k: '$$s.status', v: '$$s.count' },
              },
            },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    const months = Array.from({ length: 6 }, (_, i) => format(subMonths(utcNow, 5 - i), 'MMM'));

    // Format for recharts
    const shipmentData = months.map(monthName => {
      // item._id is 'YYYY-MM'. Add '-01T12:00:00Z' to force UTC interpretation
      const monthData = shipmentCounts.find(item => format(new Date(`${item._id}-01T12:00:00Z`), 'MMM') === monthName);
      return {
        name: monthName,
        Delivered: monthData?.statuses?.Delivered || 0,
        Pending: monthData?.statuses?.Pending || 0,
        'In Transit': monthData?.statuses['In Transit'] || 0,
        Cancelled: monthData?.statuses?.Cancelled || 0,
      };
    });

    // 3. Revenue & Expenses Chart Data (last 6 months)
    const revenueByMonth = await Payment.aggregate([
      { $match: { transactionDate: { $gte: firstDayOfPeriod }, status: 'Completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$transactionDate' } },
          revenue: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create a map for efficient lookup
    const revenueMap = new Map(
      revenueByMonth.map(item => [format(new Date(`${item._id}-01T12:00:00Z`), 'MMM'), item.revenue])
    );

    const revenueData = months.map(monthName => ({
      name: monthName,
      revenue: revenueMap.get(monthName) || 0,
    }));

    // New Charts Data
    // 3. Shipment Status Distribution (Pie Chart)
    const statusDistribution = await Shipment.aggregate([
      { $group: { _id: '$status', value: { $sum: 1 } } },
      { $project: { name: '$_id', value: 1, _id: 0 } },
    ]);

    // 4. Customer Growth (Area Chart)
    const customerGrowth = await User.aggregate([
      { $match: { role: 'customer', createdAt: { $gte: firstDayOfPeriod } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Create a map for efficient lookup
    const customerGrowthMap = new Map(
      customerGrowth.map(item => {
        // item._id is 'YYYY-MM'. Add '-01T12:00:00Z' to force UTC interpretation
        const monthName = format(new Date(`${item._id}-01T12:00:00Z`), 'MMM');
        return [monthName, item.count];
      })
    );

    const customerGrowthData = months.map(monthName => ({
      name: monthName,
      customers: customerGrowthMap.get(monthName) || 0,
    }));

    // 5. Top Performing Agents (Bar Chart)
    const topAgents = await Shipment.aggregate([
      { $match: { status: 'Delivered', agent: { $ne: null } } },
      { $group: { _id: '$agent', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'agentDetails',
        },
      },
      { $unwind: '$agentDetails' },
      { $project: { name: '$agentDetails.name', deliveries: '$count' } },
    ]);

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
          revenueData, // This is now a line chart
          statusDistribution,
          customerGrowthData,
          topAgents,
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