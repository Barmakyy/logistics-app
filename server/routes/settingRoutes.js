import express from 'express';
import { getSettings, updateSettings } from '../controllers/settingController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.route('/').get(getSettings).put(updateSettings);

export default router;