import { promisify } from 'util';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

const signToken = (id) => {
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRES_IN,
	});
};

export const protect = async (req, res, next) => {
	let token;
	if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
		token = req.headers.authorization.split(' ')[1];
	}

	if (!token) {
		return res.status(401).json({ status: 'fail', message: 'You are not logged in. Please log in to get access.' });
	}

	try {
		const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

		const currentUser = await User.findById(decoded.id);
		if (!currentUser) {
			return res.status(401).json({ status: 'fail', message: 'The user belonging to this token no longer exists.' });
		}

		req.user = currentUser;
		next();
	} catch (error) {
		return res.status(401).json({ status: 'fail', message: 'Invalid token. Please log in again.' });
	}
};

export const restrictTo = (...roles) => {
	return (req, res, next) => {
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({
				status: 'fail',
				message: 'You do not have permission to perform this action.',
			});
		}
		next();
	};
};

export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const newUser = await User.create({ name, email, password, role });

    res.status(201).json({
      status: 'success',
      message: 'User registered successfully.',
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error.message,
    });
  }
};

export const updatePassword = async (req, res) => {
  // 1) Get user from collection
  const user = await User.findById(req.user.id).select('+password');

  // 2) Check if POSTed current password is correct
  if (!user || !(await bcrypt.compare(req.body.currentPassword, user.password))) {
    return res.status(401).json({ status: 'fail', message: 'Your current password is wrong.' });
  }

  // 3) If so, update password
  user.password = req.body.password;
  // The passwordConfirm is not a field in the DB, but it's required for the validator on the User model.
  // We don't have a passwordConfirm field, but the frontend already checks for matching passwords.
  // To satisfy the model validation, we can temporarily set it.
  // Note: A better long-term solution might be a dedicated `passwordChangedAt` field.

  // 4) Save user and log them in, send JWT
  try {
    await user.save();
    const token = signToken(user._id);

    res.status(200).json({
      status: 'success',
      token,
      data: { user },
    });
  } catch (error) {
     res.status(500).json({ status: 'error', message: 'Error saving new password.' });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'Please provide email and password.' });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Incorrect email or password.' });
    }

    const token = signToken(user._id);

    // Omit password from the output
    user.password = undefined;

    res.status(200).json({
      status: 'success',
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Something went wrong during login.',
    });
  }
};

export const updateMe = async (req, res) => {
  try {
    // 1) Create error if user POSTs password data
    if (req.body.password || req.body.passwordConfirm) {
      return res.status(400).json({ status: 'fail', message: 'This route is not for password updates. Please use /update-password.' });
    }

    // 2) Filtered out unwanted fields names that are not allowed to be updated
    const filteredBody = {};
    if (req.body.name) filteredBody.name = req.body.name;
    if (req.body.email) filteredBody.email = req.body.email;
    // Allow updating the phone number, even to an empty string
    if (req.body.phone !== undefined) filteredBody.phone = req.body.phone;
    if (req.body.profilePicture) filteredBody.profilePicture = req.body.profilePicture;

    // 3) Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, { new: true, runValidators: true });

    res.status(200).json({ status: 'success', data: { user: updatedUser } });
  } catch (error) {
    res.status(400).json({ status: 'fail', message: error.message });
  }
};