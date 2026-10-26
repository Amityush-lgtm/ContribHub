import User from '../models/User.js';
import MentorshipAssignment from '../models/MentorshipAssignment.js';
import { generateToken } from '../middleware/auth.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.'
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deactivated. Please contact an administrator.'
      });
    }

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(200).json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

export const logout = (req, res) => {
  res.clearCookie('token');
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = req.user;
    let assignments = [];

    if (user.role === 'mentor') {
      assignments = await MentorshipAssignment.find({ mentorId: user._id, status: 'active' })
        .populate('menteeId', 'name email skills interests');
    } else if (user.role === 'mentee') {
      assignments = await MentorshipAssignment.find({ menteeId: user._id, status: 'active' })
        .populate('mentorId', 'name email skills');
    }

    res.status(200).json({
      success: true,
      user: { ...user.toJSON(), assignments }
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, skills, interests } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (Array.isArray(skills)) user.skills = skills;
    if (Array.isArray(interests)) user.interests = interests;

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (err) {
    next(err);
  }
};
