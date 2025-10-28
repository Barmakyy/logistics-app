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