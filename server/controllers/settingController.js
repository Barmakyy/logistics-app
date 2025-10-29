import Setting from '../models/Setting.js';

// @desc    Get application settings
// @route   GET /api/settings
// @access  Private/Admin
export const getSettings = async (req, res) => {
  try {
    // Find or create the single settings document
    let settings = await Setting.findOne({ singleton: 'main' });
    if (!settings) {
      settings = await Setting.create({ singleton: 'main' });
    }
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
};

// @desc    Update application settings
// @route   PUT /api/settings
// @access  Private/Admin
export const updateSettings = async (req, res) => {
  try {
    const settings = await Setting.findOneAndUpdate({ singleton: 'main' }, req.body, {
      new: true,
      upsert: true, // Create if it doesn't exist
      runValidators: true,
    });
    res.status(200).json({ status: 'success', data: { settings } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};