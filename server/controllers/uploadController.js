import multer from 'multer';
import path from 'path';
import User from '../models/User.js';
import Setting from '../models/Setting.js';

// Set up storage engine
const storage = multer.diskStorage({
  destination: './uploads/',
  filename: (req, file, cb) => {
    cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Initialize upload
export const upload = multer({
  storage,
  limits: { fileSize: 1000000 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb('Error: Images Only!');
  },
});

export const uploadProfilePicture = async (req, res) => {
  try {
    res.status(201).json({
      status: 'success',
      message: 'Profile picture uploaded successfully.',
      filePath: `/uploads/${req.file.filename}`,
    });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};

export const uploadCompanyLogo = async (req, res) => {
  try {
    await Setting.findOneAndUpdate({ singleton: 'main' }, { logo: `/uploads/${req.file.filename}` });
    res.status(200).json({ status: 'success', message: 'Logo uploaded successfully.', filePath: `/uploads/${req.file.filename}` });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};