import Contribution from '../models/Contribution.js';
import MentorshipAssignment from '../models/MentorshipAssignment.js';

// URL validator helper
const isValidUrl = (string) => {
  if (!string || string.trim() === '') return true;
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
};

// POST /api/contributions - Create draft or submitted contribution
export const createContribution = async (req, res, next) => {
  try {
    const {
      projectName,
      repositoryUrl,
      title,
      summary,
      contributionType,
      issueUrl,
      pullRequestUrl,
      technologies,
      problemSolved,
      solutionDescription,
      validation,
      outcome,
      evidenceUrls,
      pullRequestStatus,
      submit
    } = req.body;

    // Required fields check
    if (!projectName || !repositoryUrl || !title || !problemSolved || !solutionDescription) {
      return res.status(400).json({
        success: false,
        message: 'Project name, repository URL, title, problem solved, and solution description are required.'
      });
    }

    // Validate URLs
    const urlsToValidate = [
      { name: 'Repository URL', url: repositoryUrl },
      { name: 'Issue URL', url: issueUrl },
      { name: 'Pull Request URL', url: pullRequestUrl }
    ];

    for (const item of urlsToValidate) {
      if (item.url && !isValidUrl(item.url)) {
        return res.status(400).json({
          success: false,
          message: `Invalid format for ${item.name}. Must be a valid URL starting with http:// or https://`
        });
      }
    }

    const techArray = Array.isArray(technologies)
      ? technologies
      : typeof technologies === 'string'
      ? technologies.split(',').map((t) => t.trim()).filter(Boolean)
      : [];

    const evidenceArray = Array.isArray(evidenceUrls)
      ? evidenceUrls
      : typeof evidenceUrls === 'string'
      ? evidenceUrls.split('\n').map((u) => u.trim()).filter(Boolean)
      : [];

    const contribution = await Contribution.create({
      menteeId: req.user._id,
      projectName: projectName.trim(),
      repositoryUrl: repositoryUrl.trim(),
      title: title.trim(),
      summary: summary?.trim(),
      contributionType: contributionType || 'bug_fix',
      issueUrl: issueUrl?.trim(),
      pullRequestUrl: pullRequestUrl?.trim(),
      technologies: techArray,
      problemSolved: problemSolved.trim(),
      solutionDescription: solutionDescription.trim(),
      validation: validation?.trim(),
      outcome: outcome?.trim(),
      evidenceUrls: evidenceArray,
      pullRequestStatus: pullRequestStatus || 'unknown',
      reviewStatus: submit ? 'submitted' : 'draft'
    });

    res.status(201).json({
      success: true,
      message: submit
        ? 'Contribution submitted for mentor review!'
        : 'Contribution draft saved successfully.',
      contribution
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/contributions/mine - List records for the current mentee
export const getMyContributions = async (req, res, next) => {
  try {
    const { reviewStatus, contributionType, search } = req.query;
    const filter = { menteeId: req.user._id };

    if (reviewStatus) filter.reviewStatus = reviewStatus;
    if (contributionType) filter.contributionType = contributionType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } }
      ];
    }

    const contributions = await Contribution.find(filter)
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1 });

    // Status breakdown stats
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
      count: contributions.length,
      contributions
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/contributions - Role-aware contribution listing
export const getContributions = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { reviewStatus, contributionType, menteeId, search } = req.query;
    let filter = {};

    if (role === 'mentee') {
      filter.menteeId = req.user._id;
    } else if (role === 'mentor') {
      // Find assigned mentees
      const assignments = await MentorshipAssignment.find({
        mentorId: req.user._id,
        status: 'active'
      }).select('menteeId');
      const menteeIds = assignments.map((a) => a.menteeId);
      filter.menteeId = { $in: menteeIds };
    } else if (role === 'admin' && menteeId) {
      filter.menteeId = menteeId;
    }

    if (reviewStatus) filter.reviewStatus = reviewStatus;
    if (contributionType) filter.contributionType = contributionType;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { projectName: { $regex: search, $options: 'i' } }
      ];
    }

    const contributions = await Contribution.find(filter)
      .populate('menteeId', 'name email skills interests')
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: contributions.length,
      contributions
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/contributions/:id - Get single record with strict RBAC
export const getContributionById = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id)
      .populate('menteeId', 'name email skills interests')
      .populate('reviewedBy', 'name email');

    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution record not found.' });
    }

    // Permission check
    const { user } = req;
    const isOwner = contribution.menteeId._id.toString() === user._id.toString();

    if (user.role === 'mentee' && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: You cannot view contributions belonging to other mentees.'
      });
    }

    if (user.role === 'mentor') {
      const isAssigned = await MentorshipAssignment.findOne({
        mentorId: user._id,
        menteeId: contribution.menteeId._id,
        status: 'active'
      });
      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: This contribution does not belong to a mentee in your cohort.'
        });
      }
    }

    res.status(200).json({ success: true, contribution });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/contributions/:id - Update permitted record
export const updateContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution record not found.' });
    }

    const { user } = req;
    const isOwner = contribution.menteeId.toString() === user._id.toString();

    if (user.role === 'mentee') {
      if (!isOwner) {
        return res.status(403).json({ success: false, message: 'Forbidden: You do not own this record.' });
      }
      if (!['draft', 'changes_requested'].includes(contribution.reviewStatus)) {
        return res.status(400).json({
          success: false,
          message: `Cannot edit a contribution with status "${contribution.reviewStatus}". Only drafts and records with changes requested can be edited.`
        });
      }
    } else if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only mentees or admins can edit contribution contents.' });
    }

    // Updatable fields
    const editableFields = [
      'projectName',
      'repositoryUrl',
      'title',
      'summary',
      'contributionType',
      'issueUrl',
      'pullRequestUrl',
      'technologies',
      'problemSolved',
      'solutionDescription',
      'validation',
      'outcome',
      'evidenceUrls',
      'pullRequestStatus'
    ];

    editableFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        contribution[field] = req.body[field];
      }
    });

    if (req.body.submit) {
      contribution.reviewStatus = 'submitted';
    }

    await contribution.save();
    res.status(200).json({
      success: true,
      message: 'Contribution updated successfully.',
      contribution
    });
  } catch (err) {
    next(err);
  }
};

// POST /api/contributions/:id/submit - Transition draft to submitted
export const submitContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution record not found.' });
    }

    const isOwner = contribution.menteeId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the owner can submit this record.' });
    }

    if (!['draft', 'changes_requested'].includes(contribution.reviewStatus)) {
      return res.status(400).json({
        success: false,
        message: `Record is already in "${contribution.reviewStatus}" state and cannot be submitted.`
      });
    }

    // Required fields check before submission
    if (!contribution.projectName || !contribution.repositoryUrl || !contribution.title || !contribution.problemSolved || !contribution.solutionDescription) {
      return res.status(400).json({
        success: false,
        message: 'Cannot submit: Please ensure project name, repository URL, title, problem, and solution description are completed.'
      });
    }

    contribution.reviewStatus = 'submitted';
    await contribution.save();

    res.status(200).json({
      success: true,
      message: 'Contribution successfully submitted for mentor review!',
      contribution
    });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/contributions/:id - Delete draft
export const deleteContribution = async (req, res, next) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution record not found.' });
    }

    const isOwner = contribution.menteeId.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Forbidden: Only the creator or an admin can delete this record.' });
    }

    if (contribution.reviewStatus !== 'draft' && req.user.role !== 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Only draft contributions can be deleted. Records under review or approved cannot be deleted.'
      });
    }

    await contribution.deleteOne();
    res.status(200).json({ success: true, message: 'Contribution draft deleted successfully.' });
  } catch (err) {
    next(err);
  }
};
