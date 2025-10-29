import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import { startOfMonth, endOfMonth } from 'date-fns';

// @desc    Get all customers with pagination, search, and stats
// @route   GET /api/customers
// @access  Private/Admin
export const getCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || 'All';

    const query = { role: 'customer' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'All') {
      query.status = status;
    }

    const customers = await User.find(query)
      .select('-password') // Exclude password from the result
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    // This is a simplified way to get shipment counts. For larger scale, an aggregation would be more performant.
    const customersWithShipmentCount = await Promise.all(
      customers.map(async (customer) => {
        const shipmentCount = await Shipment.countDocuments({ customer: customer._id });
        // The customer object needs to be properly converted and then have the shipment count added.
        const customerObj = customer.toObject();
        customerObj.totalShipments = shipmentCount;
        // The original implementation was losing properties.
        return customerObj;
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        customers: customersWithShipmentCount,
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

// @desc    Get customer summary statistics
// @route   GET /api/customers/summary
// @access  Private/Admin
export const getCustomerSummary = async (req, res) => {
  try {
    const total = await User.countDocuments({ role: 'customer' });
    const active = await User.countDocuments({ role: 'customer', status: 'Active' });
    const inactive = await User.countDocuments({ role: 'customer', status: 'Inactive' });

    const now = new Date();
    const shipmentsThisMonth = await Shipment.countDocuments({
      dispatchDate: {
        $gte: startOfMonth(now),
        $lte: endOfMonth(now),
      },
    });

    res.status(200).json({
      status: 'success',
      data: {
        total,
        active,
        inactive,
        shipmentsThisMonth,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update a customer
// @route   PUT /api/customers/:id
// @access  Private/Admin
export const updateCustomer = async (req, res) => {
  try {
    const { name, email, phone, location, status } = req.body;

    // Find user and update only allowed fields
    // Exclude role and password from being updated through this endpoint
    const customer = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, location, status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!customer) {
      return res.status(404).json({ status: 'fail', message: 'No customer found with that ID' });
    }

    res.status(200).json({ status: 'success', data: { customer } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete a customer
// @route   DELETE /api/customers/:id
// @access  Private/Admin
export const deleteCustomer = async (req, res) => {
  try {
    const customer = await User.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({ status: 'fail', message: 'No customer found with that ID' });
    }

    // Optional: Decide what to do with shipments from this customer.
    // For now, we'll just delete the user.
    // await Shipment.deleteMany({ customer: req.params.id });

    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private/Admin
export const createCustomer = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'fail', message: 'Customer with this email already exists' });
    }

    const customer = await User.create({
      name,
      email,
      password,
      phone,
      location,
      role: 'customer',
      // The User model should handle the 'status' default and password hashing
    });

    // Don't send password back
    customer.password = undefined;

    res.status(201).json({ status: 'success', data: { customer } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};