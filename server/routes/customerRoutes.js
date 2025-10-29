import express from 'express';
import { getCustomers, getCustomerSummary, updateCustomer, deleteCustomer, createCustomer } from '../controllers/customerController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect, restrictTo('admin'));

router.get('/summary', getCustomerSummary);

router.route('/')
  .get(getCustomers)
  .post(createCustomer);

router.route('/:id')
  .put(updateCustomer)
  .delete(deleteCustomer);

export default router;