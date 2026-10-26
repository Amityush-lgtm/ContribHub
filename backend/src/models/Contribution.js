import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentee ID is required']
    },
    projectName: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true
    },
    repositoryUrl: {
      type: String,
      required: [true, 'Repository URL is required'],
      trim: true
    },
    title: {
      type: String,
      required: [true, 'Contribution title is required'],
      trim: true
    },
    summary: {
      type: String,
      trim: true
    },
    contributionType: {
      type: String,
      enum: [
        'bug_fix',
        'feature',
        'documentation',
        'testing',
        'refactoring',
        'research',
        'other'
      ],
      default: 'bug_fix'
    },
    issueUrl: {
      type: String,
      trim: true
    },
    pullRequestUrl: {
      type: String,
      trim: true
    },
    technologies: {
      type: [String],
      default: []
    },
    problemSolved: {
      type: String,
      required: [true, 'Problem solved explanation is required'],
      trim: true
    },
    solutionDescription: {
      type: String,
      required: [true, 'Solution description is required'],
      trim: true
    },
    validation: {
      type: String,
      trim: true
    },
    outcome: {
      type: String,
      trim: true
    },
    evidenceUrls: {
      type: [String],
      default: []
    },
    reviewStatus: {
      type: String,
      enum: ['draft', 'submitted', 'changes_requested', 'approved', 'rejected'],
      default: 'draft'
    },
    pullRequestStatus: {
      type: String,
      enum: ['unknown', 'open', 'review_requested', 'merged', 'closed'],
      default: 'unknown'
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    mentorFeedback: {
      type: String,
      trim: true
    },
    reviewedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

contributionSchema.index({ menteeId: 1, reviewStatus: 1 });

const Contribution = mongoose.model('Contribution', contributionSchema);

export default Contribution;
