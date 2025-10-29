import User from '../models/User.js';
import Shipment from '../models/Shipment.js';
import { startOfMonth, endOfMonth } from 'date-fns';

// Helper function to simulate agent performance data
const getAgentPerformance = async (agentId) => {
  const totalDeliveries = await Shipment.countDocuments({ agent: agentId, status: 'Delivered' });
  // Simulate rating for now, in a real app this would be calculated from feedback
  const rating = (totalDeliveries % 5) + 3.5; // Example: 3.5 to 4.9
  return { totalDeliveries, rating: parseFloat(rating.toFixed(1)) };
};

// @desc    Get all agents with pagination, search, and filtering
// @route   GET /api/agents
// @access  Private/Admin
export const getAgents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const statusFilter = req.query.status || 'All';
    const regionFilter = req.query.region || 'All';

    const query = { role: 'agent' };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }, // Search by region/location
      ];
    }

    if (statusFilter && statusFilter !== 'All') {
      query.status = statusFilter;
    }

    if (regionFilter && regionFilter !== 'All Regions') {
      query.location = regionFilter;
    }

    const agents = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await User.countDocuments(query);

    const agentsWithPerformance = await Promise.all(
      agents.map(async (agent) => {
        const performance = await getAgentPerformance(agent._id);
        return { ...agent.toObject(), ...performance };
      })
    );

    res.status(200).json({
      status: 'success',
      data: {
        agents: agentsWithPerformance,
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

// @desc    Get agent summary statistics
// @route   GET /api/agents/summary
// @access  Private/Admin
export const getAgentSummary = async (req, res) => {
  try {
    const totalAgents = await User.countDocuments({ role: 'agent' });
    const activeOnDelivery = await User.countDocuments({ role: 'agent', status: 'Active' });
    const availableIdle = await User.countDocuments({ role: 'agent', status: 'Idle' });
    const inactiveOffDuty = await User.countDocuments({ role: 'agent', status: 'Inactive' });

    res.status(200).json({
      status: 'success',
      data: {
        totalAgents,
        activeOnDelivery,
        availableIdle,
        inactiveOffDuty,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Create a new agent
// @route   POST /api/agents
// @access  Private/Admin
export const createAgent = async (req, res) => {
  try {
    const { name, email, phone, location } = req.body;

    // Assign a default temporary password. The agent can change it later.
    const password = 'password123';

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ status: 'fail', message: 'Agent with this email already exists' });
    }

    const agent = await User.create({
      name,
      email,
      password,
      phone,
      location,
      role: 'agent',
      status: 'Idle', // Agents start as Idle by default
    });

    agent.password = undefined;

    res.status(201).json({ status: 'success', data: { agent } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Update an agent
// @route   PUT /api/agents/:id
// @access  Private/Admin
export const updateAgent = async (req, res) => {
  try {
    const { name, email, phone, location, status } = req.body;

    // Exclude role and password from being updated through this endpoint
    const agent = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, location, status },
      { new: true, runValidators: true }
    ).select('-password');

    if (!agent) {
      return res.status(404).json({ status: 'fail', message: 'No agent found with that ID' });
    }

    res.status(200).json({ status: 'success', data: { agent } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Delete an agent
// @route   DELETE /api/agents/:id
// @access  Private/Admin
export const deleteAgent = async (req, res) => {
  try {
    const agent = await User.findById(req.params.id);

    if (!agent || agent.role !== 'agent') {
      return res.status(404).json({ status: 'fail', message: 'No agent found with that ID' });
    }

    // For now, we'll just delete the user.
    await User.findByIdAndDelete(req.params.id);

    res.status(204).json({ status: 'success', data: null });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

// @desc    Get a list of all agents for dropdowns
// @route   GET /api/agents/list
// @access  Private/Admin
export const getAgentsList = async (req, res) => {
  try {
    const agents = await User.find({ role: 'agent' }).select('name');
    res.status(200).json({
      status: 'success',
      data: { agents },
    });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};