import Shipment from '../models/Shipment.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Get customer dashboard stats
// @route   GET /api/customer-dashboard/stats
// @access  Private/Customer
export const getCustomerStats = async (req, res) => {
  try {
    const customerId = req.user.id;

    const totalShipments = await Shipment.countDocuments({ customer: customerId });
    const deliveredShipments = await Shipment.countDocuments({ customer: customerId, status: 'Delivered' });
    const pendingShipments = await Shipment.countDocuments({ customer: customerId, status: { $in: ['Pending', 'In Transit', 'Delayed'] } });

    const recentShipments = await Shipment.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select('shipmentId destination status dispatchDate');

    res.status(200).json({
      status: 'success',
      data: {
        metrics: { totalShipments, deliveredShipments, pendingShipments },
        recentShipments,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch customer dashboard stats.', error: error.message });
  }
};

// @desc    Get all shipments for the logged-in customer
// @route   GET /api/customer-dashboard/shipments
// @access  Private/Customer
export const getCustomerShipments = async (req, res) => {
  try {
    const customerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'All';

    const query = { customer: customerId };

    if (search) {
      query.shipmentId = { $regex: search, $options: 'i' };
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const shipments = await Shipment.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Shipment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        shipments,
        pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch customer shipments.', error: error.message });
  }
};

// @desc    Create a new shipment for the logged-in customer
// @route   POST /api/customer-dashboard/shipments
// @access  Private/Customer
export const createCustomerShipment = async (req, res) => {
  try {
    const { origin, destination, weight, packageDetails } = req.body;

    const newShipment = await Shipment.create({
      customer: req.user.id,
      origin,
      destination,
      weight,
      packageDetails,
      status: 'Pending', // Shipments created by customers start as Pending
      cost: Math.max(20, weight * 5), // Dummy cost calculation
      // Add initial tracking history entry
      trackingHistory: [
        {
          status: 'Pending',
          location: origin,
          timestamp: new Date(),
        },
      ],
    });

    // --- Create a notification for all admins ---
    const admins = await User.find({ role: 'admin' });
    const notificationPromises = admins.map(admin =>
      Notification.create({
        user: admin._id,
        text: `New shipment (${newShipment.shipmentId}) booked by ${req.user.name}.`,
        link: '/admin/dashboard/shipments',
      })
    );
    await Promise.all(notificationPromises);
    // --- End notification creation ---

    res.status(201).json({ status: 'success', data: { shipment: newShipment } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get a single shipment for the logged-in customer
// @route   GET /api/customer-dashboard/shipments/:id
// @access  Private/Customer
export const getCustomerShipmentDetails = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({
      _id: req.params.id,
      customer: req.user.id,
    }).populate('customer', 'name email');

    if (!shipment) {
      return res.status(404).json({ status: 'fail', message: 'Shipment not found or you do not have permission to view it.' });
    }

    res.status(200).json({
      status: 'success',
      data: { shipment },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: 'Failed to fetch shipment details.', error: error.message });
  }
};