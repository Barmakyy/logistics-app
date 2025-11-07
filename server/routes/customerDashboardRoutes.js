import express from 'express';
import { getCustomerStats, getCustomerShipments, createCustomerShipment, getCustomerShipmentDetails, getCustomerPaymentSummary, getCustomerPaymentHistory, generateCustomerInvoice, processCustomerPayment } from '../controllers/customerDashboardController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, restrictTo('customer'));

router.get('/stats', getCustomerStats);
router.get('/payments/summary', getCustomerPaymentSummary);
router.get('/payments', getCustomerPaymentHistory);
router.get('/payments/:id/invoice', generateCustomerInvoice);
router.post('/payments/:id/pay', processCustomerPayment);
router.get('/shipments/:id', getCustomerShipmentDetails);

router.route('/shipments')
  .get(getCustomerShipments)
  .post(createCustomerShipment);

export default router;