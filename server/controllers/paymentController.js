import Payment from '../models/Payment.js';
import User from '../models/User.js';
import Shipment from '../models/Shipment.js';

// @desc    Get all payments with pagination and search
// @route   GET /api/payments
// @access  Private/Admin
export const getPayments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'All';

    let query = {};

    if (status && status !== 'All') {
      query.status = status;
    }

    if (search) {
      const customers = await User.find({ name: { $regex: search, $options: 'i' } }).select('_id');
      const customerIds = customers.map(c => c._id);
      query = {
        ...query,
        $or: [
          { paymentId: { $regex: search, $options: 'i' } },
          { customer: { $in: customerIds } },
        ],
      };
    }

    const payments = await Payment.find(query)
      .populate('customer', 'name')
      .populate('shipment', 'shipmentId')
      .sort({ transactionDate: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Payment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        payments,
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

// @desc    Create a new payment
// @route   POST /api/payments
// @access  Private/Admin
export const createPayment = async (req, res) => {
  try {
    const { shipmentId, amount, method, status } = req.body;

    // Find the shipment to link the payment to
    const shipment = await Shipment.findOne({ shipmentId });
    if (!shipment) {
      return res.status(404).json({ status: 'fail', message: `Shipment with ID ${shipmentId} not found` });
    }

    const newPayment = await Payment.create({
      shipment: shipment._id,
      customer: shipment.customer, // Get customer from the shipment
      amount: amount || shipment.cost, // Use provided amount or default to shipment cost
      method,
      status: status || 'Completed', // Default to 'Completed' since admin is adding it
    });

    res.status(201).json({ status: 'success', data: { payment: newPayment } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get payment summary statistics
// @route   GET /api/payments/summary
// @access  Private/Admin
export const getPaymentSummary = async (req, res) => {
  try {
    const totalRevenueResult = await Payment.aggregate([
      { $match: { status: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

    const pendingPaymentsResult = await Payment.aggregate([
      { $match: { status: 'Pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
    const pendingPayments = pendingPaymentsResult.length > 0 ? pendingPaymentsResult[0].total : 0;

    const completedCount = await Payment.countDocuments({ status: 'Completed' });
    const failedOrRefundedCount = await Payment.countDocuments({ status: { $in: ['Failed', 'Refunded'] } });

    res.status(200).json({
      status: 'success',
      data: {
        totalRevenue,
        pendingPayments,
        completedCount,
        failedOrRefundedCount,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Get payment data for chart
// @route   GET /api/payments/chart-data
// @access  Private/Admin
export const getPaymentChartData = async (req, res) => {
  try {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    const monthlyRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'Completed',
          transactionDate: { $gte: oneYearAgo },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$transactionDate' },
            month: { $month: '$transactionDate' },
          },
          revenue: { $sum: '$amount' },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 },
      },
    ]);

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const chartData = monthlyRevenue.map(item => ({
      month: `${monthNames[item._id.month - 1]} '${String(item._id.year).slice(2)}`,
      revenue: item.revenue,
    }));

    res.status(200).json({ status: 'success', data: { chartData } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};