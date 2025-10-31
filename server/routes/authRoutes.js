import express from 'express';
import { register, login, protect, updatePassword, updateMe } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.use(protect);

router.patch('/update-password', protect, updatePassword);
router.patch('/update-me', updateMe);

export default router;