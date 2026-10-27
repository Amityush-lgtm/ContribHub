import User from '../models/User.js';
import MentorshipAssignment from '../models/MentorshipAssignment.js';

// Admin: list all users
export const listUsers = async (req, res, next) => {
  try {
    const { role, search, isActive } = req.query;
    const filter = {};

    if (role) filter.role = role;
    if (typeof isActive !== 'undefined') filter.isActive = isActive === 'true';
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter).select('-passwordHash').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (err) {
    next(err);
  }
};

// Admin: provision a new user
export const createUser = async (req, res, next) => {
  try {
    const { name, email, password, role, skills, interests } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, password, and role are required.'
      });
    }

    if (await User.findOne({ email: email.toLowerCase() })) {
      return res.status(409).json({
        success: false,
        message: 'A user with this email address already exists.'
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role,
      githubUsername: req.body.githubUsername ? req.body.githubUsername.trim().replace(/^@/, '') : '',
      skills: Array.isArray(skills) ? skills : [],
      interests: Array.isArray(interests) ? interests : []
    });

    res.status(201).json({
      success: true,
      message: `User ${user.name} created successfully.`,
      user
    });
  } catch (err) {
    next(err);
  }
};

// Admin: update user details or status
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const fields = ['name', 'role', 'skills', 'interests', 'isActive', 'githubUsername'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) user[f] = req.body[f];
    });

    if (req.body.password) {
      user.passwordHash = await User.hashPassword(req.body.password);
    }

    await user.save();
    res.status(200).json({ success: true, message: 'User updated successfully.', user });
  } catch (err) {
    next(err);
  }
};

// Mentor: get list of assigned mentees
export const getMyMentees = async (req, res, next) => {
  try {
    const assignments = await MentorshipAssignment.find({
      mentorId: req.user._id,
      status: 'active'
    }).populate('menteeId', 'name email skills interests createdAt');

    const mentees = assignments.map((a) => ({
      assignmentId: a._id,
      cohortName: a.cohortName,
      startDate: a.startDate,
      mentee: a.menteeId
    }));

    res.status(200).json({ success: true, count: mentees.length, mentees });
  } catch (err) {
    next(err);
  }
};
