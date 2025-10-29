import express from 'express';
import { getPayments, getPaymentSummary, getPaymentChartData, createPayment } from '../controllers/paymentController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/summary', getPaymentSummary);
router.get('/chart-data', getPaymentChartData);

router.route('/')
  .get(getPayments)
  .post(createPayment);

export default router;