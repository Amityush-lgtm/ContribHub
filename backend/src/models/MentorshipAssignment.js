import mongoose from 'mongoose';

const mentorshipAssignmentSchema = new mongoose.Schema(
  {
    mentorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentor ID is required']
    },
    menteeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Mentee ID is required']
    },
    cohortName: {
      type: String,
      trim: true,
      default: 'Spring 2026 Cohort'
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    endDate: {
      type: Date
    },
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active'
    }
  },
  {
    timestamps: true
  }
);

// Compound index to prevent duplicate active assignments for the same mentor and mentee
mentorshipAssignmentSchema.index({ mentorId: 1, menteeId: 1, status: 1 });

const MentorshipAssignment = mongoose.model(
  'MentorshipAssignment',
  mentorshipAssignmentSchema
);

export default MentorshipAssignment;
