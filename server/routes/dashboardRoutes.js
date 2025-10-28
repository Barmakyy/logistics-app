import express from 'express';
import { getStats } from '../controllers/dashboardController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// All routes in this file are protected and restricted to admins
router.get('/stats', protect, restrictTo('admin'), getStats);

export default router;