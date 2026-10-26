import MentorshipAssignment from '../models/MentorshipAssignment.js';
import User from '../models/User.js';

// Create a new mentorship assignment (Admin only)
export const createAssignment = async (req, res, next) => {
  try {
    const { mentorId, menteeId, cohortName, startDate, endDate } = req.body;

    if (!mentorId || !menteeId) {
      return res.status(400).json({ success: false, message: 'Both mentorId and menteeId are required.' });
    }

    const [mentor, mentee] = await Promise.all([
      User.findById(mentorId),
      User.findById(menteeId)
    ]);

    if (!mentor || mentor.role !== 'mentor') {
      return res.status(400).json({ success: false, message: 'Invalid mentor specified.' });
    }
    if (!mentee || mentee.role !== 'mentee') {
      return res.status(400).json({ success: false, message: 'Invalid mentee specified.' });
    }

    const existing = await MentorshipAssignment.findOne({ mentorId, menteeId, status: 'active' });
    if (existing) {
      return res.status(409).json({ success: false, message: 'An active assignment already exists for this pair.' });
    }

    const assignment = await MentorshipAssignment.create({
      mentorId,
      menteeId,
      cohortName: cohortName || 'Spring 2026 Cohort',
      startDate: startDate || new Date(),
      endDate
    });

    await assignment.populate([
      { path: 'mentorId', select: 'name email skills' },
      { path: 'menteeId', select: 'name email skills interests' }
    ]);

    res.status(201).json({ success: true, message: 'Mentorship assignment created.', assignment });
  } catch (err) {
    next(err);
  }
};

// Get assignments visible to user role
export const getAssignments = async (req, res, next) => {
  try {
    const { user } = req;
    const query = {};

    if (user.role === 'mentor') query.mentorId = user._id;
    if (user.role === 'mentee') query.menteeId = user._id;
    if (req.query.status) query.status = req.query.status;

    const assignments = await MentorshipAssignment.find(query)
      .populate('mentorId', 'name email skills')
      .populate('menteeId', 'name email skills interests')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: assignments.length, assignments });
  } catch (err) {
    next(err);
  }
};

// Update assignment (Admin only)
export const updateAssignment = async (req, res, next) => {
  try {
    const { status, cohortName, endDate } = req.body;
    const assignment = await MentorshipAssignment.findById(req.params.id);

    if (!assignment) {
      return res.status(404).json({ success: false, message: 'Assignment not found.' });
    }

    if (status) assignment.status = status;
    if (cohortName) assignment.cohortName = cohortName.trim();
    if (endDate) assignment.endDate = endDate;

    await assignment.save();
    await assignment.populate([
      { path: 'mentorId', select: 'name email' },
      { path: 'menteeId', select: 'name email' }
    ]);

    res.status(200).json({ success: true, message: 'Assignment updated.', assignment });
  } catch (err) {
    next(err);
  }
};
