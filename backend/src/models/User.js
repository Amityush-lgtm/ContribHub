import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
    },
    passwordHash: {
      type: String,
      required: [true, 'Password is required']
    },
    role: {
      type: String,
      enum: {
        values: ['mentee', 'mentor', 'admin'],
        message: '{VALUE} is not a valid role'
      },
      default: 'mentee'
    },
    skills: {
      type: [String],
      default: []
    },
    interests: {
      type: [String],
      default: []
    },
    githubUsername: {
      type: String,
      trim: true,
      default: ''
    },
    // Mentor credibility fields
    organization: {
      type: String,
      trim: true,
      default: ''
    },
    title: {
      type: String,
      trim: true,
      default: ''
    },
    yearsOfExperience: {
      type: Number,
      default: 0
    },
    linkedinUrl: {
      type: String,
      trim: true,
      default: ''
    },
    mentorBio: {
      type: String,
      trim: true,
      default: ''
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Method to verify candidate password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.passwordHash);
};

// Static helper to hash passwords
userSchema.statics.hashPassword = async function (plainPassword) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plainPassword, salt);
};

// Exclude passwordHash from JSON representation
userSchema.methods.toJSON = function () {
  const user = this.toObject({ virtuals: true });
  delete user.passwordHash;
  return user;
};

const User = mongoose.model('User', userSchema);

export default User;
