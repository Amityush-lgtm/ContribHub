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

export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, skills, interests, githubUsername } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required.'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long.'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists.'
      });
    }

    const allowedRoles = ['mentee', 'mentor', 'admin'];
    const assignedRole = allowedRoles.includes(role) ? role : 'mentee';

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: assignedRole,
      skills: Array.isArray(skills)
        ? skills
        : typeof skills === 'string'
        ? skills.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      interests: Array.isArray(interests)
        ? interests
        : typeof interests === 'string'
        ? interests.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      githubUsername: githubUsername ? githubUsername.trim().replace(/^@/, '') : ''
    });

    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.status(201).json({
      success: true,
      message: `Account created successfully! Welcome, ${user.name}.`,
      token,
      user
    });
  } catch (err) {
    next(err);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const { name, skills, interests, githubUsername } = req.body;
    const user = req.user;

    if (name) user.name = name.trim();
    if (Array.isArray(skills)) user.skills = skills;
    if (Array.isArray(interests)) user.interests = interests;
    if (typeof githubUsername !== 'undefined') {
      user.githubUsername = githubUsername.trim().replace(/^@/, '');
    }

    await user.save();
    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (err) {
    next(err);
  }
};
