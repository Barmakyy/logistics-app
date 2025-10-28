import express from 'express';
import {
  getShipments,
  createShipment,
  getShipmentSummary,
  updateShipment,
  deleteShipment,
} from '../controllers/shipmentController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

// All routes in this file are protected and restricted to admins
router.use(protect, restrictTo('admin'));
router.get('/summary', getShipmentSummary);
router.route('/').get(getShipments).post(createShipment);
router.route('/:id').put(updateShipment).delete(deleteShipment);

export default router;