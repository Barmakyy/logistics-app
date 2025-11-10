import express from 'express';
import { upload, uploadProfilePicture, uploadCompanyLogo } from '../controllers/uploadController.js';
import { protect, restrictTo } from '../controllers/authController.js';

const router = express.Router();

router.use(protect);
router.post('/profile-picture', restrictTo('admin'), upload.single('profilePicture'), uploadProfilePicture);
router.post('/customer-profile-picture', upload.single('profilePicture'), uploadProfilePicture);
router.post('/company-logo', restrictTo('admin'), upload.single('companyLogo'), uploadCompanyLogo);

export default router;