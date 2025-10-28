import Shipment from '../models/Shipment.js';
import User from '../models/User.js';

// @desc    Get all shipments with pagination and search
// @route   GET /api/shipments
// @access  Private/Admin
export const getShipments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';

    const query = search
      ? {
          $or: [
            { shipmentId: { $regex: search, $options: 'i' } },
            // We need to search on the customer's name, which requires a more complex query
          ],
        }
      : {};

    // If searching, we need to find customers first
    if (search) {
      const customers = await User.find({ name: { $regex: search, $options: 'i' }, role: 'customer' }).select('_id');
      const customerIds = customers.map(c => c._id);
      if (customerIds.length > 0) {
        query.$or.push({ customer: { $in: customerIds } });
      }
    }

    const shipments = await Shipment.find(query)
      .populate('customer', 'name')
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Shipment.countDocuments(query);

    res.status(200).json({
      status: 'success',
      data: {
        shipments,
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

// @desc    Create a new shipment
// @route   POST /api/shipments
// @access  Private/Admin
export const createShipment = async (req, res) => {
  try {
    const { customerName, origin, destination, weight, packageDetails, status } = req.body;

    // For simplicity, we'll find the first customer that matches the name.
    // In a real app, you'd likely use a customer ID from a dropdown.
    const customer = await User.findOne({ name: customerName, role: 'customer' });
    if (!customer) {
      return res.status(404).json({ status: 'fail', message: 'Customer not found' });
    }

    const newShipment = await Shipment.create({
      customer: customer._id,
      origin,
      destination,
      weight,
      packageDetails,
      status,
      cost: Math.max(20, weight * 5), // Dummy cost calculation
    });

    res.status(201).json({ status: 'success', data: { shipment: newShipment } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update a shipment
// @route   PUT /api/shipments/:id
// @access  Private/Admin
export const updateShipment = async (req, res) => {
  try {
    const shipment = await Shipment.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!shipment) {
      return res.status(404).json({ status: 'fail', message: 'No shipment found with that ID' });
    }

    res.status(200).json({ status: 'success', data: { shipment } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete a shipment
// @route   DELETE /api/shipments/:id
// @access  Private/Admin
export const deleteShipment = async (req, res) => {
  try {
    await Shipment.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get shipment summary statistics
// @route   GET /api/shipments/summary
// @access  Private/Admin
export const getShipmentSummary = async (req, res) => {
  try {
    const totalShipments = await Shipment.countDocuments();
    const inTransit = await Shipment.countDocuments({ status: 'In Transit' });
    const delivered = await Shipment.countDocuments({ status: 'Delivered' });
    const pending = await Shipment.countDocuments({ status: { $in: ['Pending', 'Delayed'] } });
    const cancelled = await Shipment.countDocuments({ status: 'Cancelled' });

    res.status(200).json({
      status: 'success',
      data: { totalShipments, inTransit, delivered, pending, cancelled },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};