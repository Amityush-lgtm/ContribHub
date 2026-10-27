import Contribution from '../models/Contribution.js';
import MentorshipAssignment from '../models/MentorshipAssignment.js';
import User from '../models/User.js';
import {
  fetchUserPullRequests,
  fetchPullRequestDetails,
  parseGitHubPrUrl,
  inferContributionType,
  inferTechnologies
} from '../services/githubService.js';

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

    // Auto-sync if user has a GitHub username and 0 contributions stored yet
    if (req.user?.githubUsername) {
      const existingCount = await Contribution.countDocuments({ menteeId: req.user._id });
      if (existingCount === 0) {
        try {
          await performGitHubSync(req.user);
        } catch (syncErr) {
          console.warn('Auto-sync notice on getMyContributions:', syncErr.message);
        }
      }
    }

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
      .populate('reviewedBy', 'name email')
      .populate('reviewHistory.reviewerId', 'name email');

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

// POST /api/contributions/:id/review - Mentor evaluation action
export const reviewContribution = async (req, res, next) => {
  try {
    const { reviewStatus, mentorFeedback } = req.body;
    const { user } = req;

    if (!['approved', 'changes_requested', 'rejected'].includes(reviewStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid review status. Must be approved, changes_requested, or rejected.'
      });
    }

    if (['changes_requested', 'rejected'].includes(reviewStatus) && (!mentorFeedback || !mentorFeedback.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Feedback is required when requesting revisions or rejecting a submission.'
      });
    }

    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ success: false, message: 'Contribution record not found.' });
    }

    // Role and assignment check
    if (user.role === 'mentor') {
      const isAssigned = await MentorshipAssignment.findOne({
        mentorId: user._id,
        menteeId: contribution.menteeId,
        status: 'active'
      });

      if (!isAssigned) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You can only review contributions from your directly assigned mentees.'
        });
      }
    } else if (user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Only assigned mentors or administrators can evaluate contributions.'
      });
    }

    const trimmedFeedback = mentorFeedback?.trim() || '';
    const reviewDate = new Date();

    contribution.reviewStatus = reviewStatus;
    contribution.mentorFeedback = trimmedFeedback;
    contribution.reviewedBy = user._id;
    contribution.reviewedAt = reviewDate;

    if (!Array.isArray(contribution.reviewHistory)) {
      contribution.reviewHistory = [];
    }
    contribution.reviewHistory.push({
      reviewerId: user._id,
      status: reviewStatus,
      feedback: trimmedFeedback,
      reviewedAt: reviewDate
    });

    await contribution.save();

    await contribution.populate([
      { path: 'menteeId', select: 'name email skills interests' },
      { path: 'reviewedBy', select: 'name email' },
      { path: 'reviewHistory.reviewerId', select: 'name email' }
    ]);

    const statusMessage =
      reviewStatus === 'approved'
        ? 'Contribution approved successfully!'
        : reviewStatus === 'changes_requested'
        ? 'Revisions requested from mentee.'
        : 'Contribution rejected with feedback.';

    res.status(200).json({
      success: true,
      message: statusMessage,
      contribution
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper: Perform GitHub PR sync for a specified user
 */
export const performGitHubSync = async (user) => {
  if (!user.githubUsername) {
    throw new Error('Please set your GitHub username in your Profile before syncing.');
  }

  const items = await fetchUserPullRequests(user.githubUsername);
  let importedCount = 0;
  let updatedCount = 0;

  for (const item of items) {
    const prUrl = item.html_url;
    const parsed = parseGitHubPrUrl(prUrl);
    if (!parsed) continue;

    const { owner, repo, pullNumber } = parsed;
    const projectName = `${owner}/${repo}`;
    const repoUrl = `https://github.com/${owner}/${repo}`;

    let prStatus = 'open';
    if (item.pull_request?.merged_at) {
      prStatus = 'merged';
    } else if (item.state === 'closed') {
      prStatus = 'closed';
    }

    // Check if this PR already exists in DB for this mentee
    let existing = await Contribution.findOne({
      menteeId: user._id,
      pullRequestUrl: prUrl
    });

    if (existing) {
      let changed = false;
      if (existing.pullRequestStatus !== prStatus) {
        existing.pullRequestStatus = prStatus;
        changed = true;
      }
      if (prStatus === 'merged' && (!existing.outcome || existing.outcome === 'Pending review')) {
        existing.outcome = 'PR successfully merged into upstream repository.';
        changed = true;
      }
      if (changed) {
        await existing.save();
        updatedCount++;
      }
    } else {
      // Create new draft contribution record
      const bodySnippet = (item.body || '').trim();
      const cleanProblem = bodySnippet.length > 20
        ? (bodySnippet.length > 400 ? bodySnippet.slice(0, 400) + '...' : bodySnippet)
        : `GitHub Pull Request #${pullNumber} in ${projectName}.`;

      const cleanSolution = `Contributed changes via Pull Request #${pullNumber} ("${item.title}").`;

      await Contribution.create({
        menteeId: user._id,
        projectName,
        repositoryUrl: repoUrl,
        title: item.title,
        summary: bodySnippet ? bodySnippet.slice(0, 200) : `Pull Request #${pullNumber} on ${projectName}`,
        contributionType: inferContributionType(item.title, item.body, item.labels),
        pullRequestUrl: prUrl,
        technologies: inferTechnologies(item.title, item.body),
        problemSolved: cleanProblem,
        solutionDescription: cleanSolution,
        validation: 'Verified via GitHub automated CI checks and branch verification',
        outcome: prStatus === 'merged' ? 'PR merged into upstream repository' : 'PR submitted on GitHub',
        pullRequestStatus: prStatus,
        reviewStatus: 'draft'
      });
      importedCount++;
    }
  }

  // Also check existing 'open' PRs of this user that were NOT in search results
  const openContributions = await Contribution.find({
    menteeId: user._id,
    pullRequestStatus: { $in: ['open', 'unknown'] },
    pullRequestUrl: { $exists: true, $ne: '' }
  }).limit(10);

  for (const contrib of openContributions) {
    const parsed = parseGitHubPrUrl(contrib.pullRequestUrl);
    if (!parsed) continue;

    try {
      const prDetails = await fetchPullRequestDetails(parsed.owner, parsed.repo, parsed.pullNumber);
      if (prDetails) {
        const latestStatus = prDetails.merged ? 'merged' : prDetails.state === 'closed' ? 'closed' : 'open';
        if (latestStatus !== contrib.pullRequestStatus) {
          contrib.pullRequestStatus = latestStatus;
          if (latestStatus === 'merged') {
            contrib.outcome = contrib.outcome || 'PR successfully merged into upstream repository.';
          }
          await contrib.save();
          updatedCount++;
        }
      }
    } catch (_) {
      // Ignore individual lookup errors to keep sync resilient
    }
  }

  return { importedCount, updatedCount, totalFound: items.length };
};

/**
 * POST /api/contributions/sync/me
 * Mentee (or any user) syncs their own GitHub contributions
 */
export const syncMyGitHubContributions = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (req.body.githubUsername && (!user.githubUsername || user.githubUsername !== req.body.githubUsername)) {
      user.githubUsername = req.body.githubUsername.trim().replace(/^@/, '');
      await user.save();
    }

    if (!user.githubUsername) {
      return res.status(400).json({
        success: false,
        message: 'No GitHub username linked. Please set your GitHub username in your Profile or provide it in the sync request.'
      });
    }

    const result = await performGitHubSync(user);
    res.status(200).json({
      success: true,
      message: `Sync complete: ${result.importedCount} new contributions imported, ${result.updatedCount} statuses refreshed!`,
      data: result
    });
  } catch (err) {
    res.status(err.message.includes('rate limit') ? 429 : 400).json({
      success: false,
      message: err.message || 'Failed to sync with GitHub.'
    });
  }
};

/**
 * POST /api/contributions/sync/:menteeId
 * Mentor or Admin syncs an assigned mentee's GitHub contributions
 */
export const syncMenteeGitHubContributions = async (req, res, next) => {
  try {
    const { menteeId } = req.params;

    if (req.user.role === 'mentor') {
      const assignment = await MentorshipAssignment.findOne({
        mentorId: req.user._id,
        menteeId,
        status: 'active'
      });
      if (!assignment) {
        return res.status(403).json({
          success: false,
          message: 'Forbidden: You are not assigned to this mentee.'
        });
      }
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Forbidden: Insufficient privileges.'
      });
    }

    const mentee = await User.findById(menteeId);
    if (!mentee) {
      return res.status(404).json({ success: false, message: 'Mentee not found.' });
    }

    if (!mentee.githubUsername) {
      return res.status(400).json({
        success: false,
        message: `${mentee.name} has not linked a GitHub username yet.`
      });
    }

    const result = await performGitHubSync(mentee);
    res.status(200).json({
      success: true,
      message: `Synced ${mentee.name}'s GitHub: ${result.importedCount} new contributions imported, ${result.updatedCount} statuses refreshed.`,
      data: result
    });
  } catch (err) {
    res.status(err.message.includes('rate limit') ? 429 : 400).json({
      success: false,
      message: err.message || 'Failed to sync mentee GitHub.'
    });
  }
};
