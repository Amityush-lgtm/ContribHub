import User from '../models/User.js';
import MentorshipAssignment from '../models/MentorshipAssignment.js';
import Contribution from '../models/Contribution.js';

// GET /api/dashboard/mentee - Mentee portfolio summary
export const getMenteeDashboard = async (req, res, next) => {
  try {
    const menteeId = req.user._id;

    const [assignment, contributions] = await Promise.all([
      MentorshipAssignment.findOne({ menteeId, status: 'active' })
        .populate('mentorId', 'name email skills githubUsername'),
      Contribution.find({ menteeId }).sort({ updatedAt: -1 })
    ]);

    const stats = {
      total: contributions.length,
      draft: contributions.filter((c) => c.reviewStatus === 'draft').length,
      submitted: contributions.filter((c) => c.reviewStatus === 'submitted').length,
      changes_requested: contributions.filter((c) => c.reviewStatus === 'changes_requested').length,
      approved: contributions.filter((c) => c.reviewStatus === 'approved').length,
      rejected: contributions.filter((c) => c.reviewStatus === 'rejected').length
    };

    res.status(200).json({
      success: true,
      stats,
      assignment,
      recentContributions: contributions.slice(0, 5)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/mentor - Mentor review queue & mentees summary
export const getMentorDashboard = async (req, res, next) => {
  try {
    const mentorId = req.user._id;

    // Fetch active assignments for this mentor
    const assignments = await MentorshipAssignment.find({ mentorId, status: 'active' })
      .populate('menteeId', 'name email skills interests githubUsername createdAt');

    const menteeIds = assignments.map((a) => a.menteeId._id);

    // Fetch contributions from these mentees
    const contributions = await Contribution.find({ menteeId: { $in: menteeIds } })
      .populate('menteeId', 'name email githubUsername')
      .sort({ updatedAt: -1 });

    const reviewQueue = contributions.filter((c) => c.reviewStatus === 'submitted');
    const approvedContributions = contributions.filter((c) => c.reviewStatus === 'approved');
    const revisionsContributions = contributions.filter((c) => c.reviewStatus === 'changes_requested');

    // Mentee progress overview
    const menteesProgress = assignments.map((a) => {
      const menteeContribs = contributions.filter(
        (c) => c.menteeId?._id?.toString() === a.menteeId._id.toString()
      );
      return {
        assignmentId: a._id,
        cohortName: a.cohortName,
        startDate: a.startDate,
        mentee: a.menteeId,
        stats: {
          total: menteeContribs.length,
          approved: menteeContribs.filter((c) => c.reviewStatus === 'approved').length,
          pending: menteeContribs.filter((c) => c.reviewStatus === 'submitted').length,
          revisions: menteeContribs.filter((c) => c.reviewStatus === 'changes_requested').length
        }
      };
    });

    res.status(200).json({
      success: true,
      stats: {
        assignedMenteesCount: assignments.length,
        pendingReviewCount: reviewQueue.length,
        approvedCount: approvedContributions.length,
        changesRequestedCount: revisionsContributions.length,
        totalCohortContributions: contributions.length
      },
      reviewQueue,
      mentees: menteesProgress,
      recentActivity: contributions.slice(0, 8)
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/dashboard/admin - Programme-wide analytics and cohort summary (Admin only)
export const getAdminDashboard = async (req, res, next) => {
  try {
    const [users, assignments, contributions] = await Promise.all([
      User.find({}).select('-passwordHash').sort({ createdAt: -1 }),
      MentorshipAssignment.find({})
        .populate('mentorId', 'name email skills')
        .populate('menteeId', 'name email skills interests')
        .sort({ createdAt: -1 }),
      Contribution.find({})
        .populate('menteeId', 'name email githubUsername')
        .populate('reviewedBy', 'name email')
        .sort({ updatedAt: -1 })
    ]);

    const userStats = {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      inactive: users.filter((u) => !u.isActive).length,
      mentees: users.filter((u) => u.role === 'mentee').length,
      mentors: users.filter((u) => u.role === 'mentor').length,
      admins: users.filter((u) => u.role === 'admin').length
    };

    const assignmentStats = {
      total: assignments.length,
      active: assignments.filter((a) => a.status === 'active').length,
      completed: assignments.filter((a) => a.status === 'completed').length,
      cohorts: [...new Set(assignments.map((a) => a.cohortName).filter(Boolean))]
    };

    const contributionStats = {
      total: contributions.length,
      draft: contributions.filter((c) => c.reviewStatus === 'draft').length,
      submitted: contributions.filter((c) => c.reviewStatus === 'submitted').length,
      changes_requested: contributions.filter((c) => c.reviewStatus === 'changes_requested').length,
      approved: contributions.filter((c) => c.reviewStatus === 'approved').length,
      rejected: contributions.filter((c) => c.reviewStatus === 'rejected').length,
      byType: {
        bug_fix: contributions.filter((c) => c.contributionType === 'bug_fix').length,
        feature: contributions.filter((c) => c.contributionType === 'feature').length,
        documentation: contributions.filter((c) => c.contributionType === 'documentation').length,
        testing: contributions.filter((c) => c.contributionType === 'testing').length,
        refactoring: contributions.filter((c) => c.contributionType === 'refactoring').length,
        research: contributions.filter((c) => c.contributionType === 'research').length,
        other: contributions.filter((c) => c.contributionType === 'other').length
      }
    };

    res.status(200).json({
      success: true,
      stats: {
        users: userStats,
        assignments: assignmentStats,
        contributions: contributionStats
      },
      recentContributions: contributions.slice(0, 10),
      recentUsers: users.slice(0, 6)
    });
  } catch (err) {
    next(err);
  }
};
