import express from 'express';
import {
  getCustomerStats,
  getCustomerShipments,
  createCustomerShipment,
  getCustomerShipmentDetails,
  getCustomerPaymentSummary,
  getCustomerPaymentHistory,
  generateCustomerInvoice,
  processCustomerPayment,
  getCustomerMessages,
  createCustomerMessage,
  deleteCustomerMessage,
} from '../controllers/customerDashboardController.js';
import { protect } from '../controllers/authController.js';

const router = express.Router();

// All routes in this file are protected
router.use(protect);

router.get('/stats', getCustomerStats);

router.route('/shipments').get(getCustomerShipments).post(createCustomerShipment);
router.get('/shipments/:id', getCustomerShipmentDetails);

router.get('/payments/summary', getCustomerPaymentSummary);
router.get('/payments', getCustomerPaymentHistory);
router.get('/payments/:id/invoice', generateCustomerInvoice);
router.post('/payments/:id/pay', processCustomerPayment);

router.route('/messages').get(getCustomerMessages).post(createCustomerMessage);
router.delete('/messages/:id', deleteCustomerMessage);

export default router;