import express from 'express';
import { getCustomerStats, getCustomerShipments, createCustomerShipment, getCustomerShipmentDetails } from '../controllers/customerDashboardController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, restrictTo('customer'));

router.get('/stats', getCustomerStats);
router.get('/shipments/:id', getCustomerShipmentDetails);

router.route('/shipments')
  .get(getCustomerShipments)
  .post(createCustomerShipment);

export default router;