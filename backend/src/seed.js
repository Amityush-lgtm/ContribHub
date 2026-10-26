import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import MentorshipAssignment from './models/MentorshipAssignment.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('ℹ️ Users already exist in database. Skipping seed.');
      return;
    }

    console.log('🌱 Seeding demo accounts for ContribHub Phase 1...');

    const defaultPassword = 'Password123!';
    const passwordHash = await User.hashPassword(defaultPassword);

    // 1. Admin
    const admin = await User.create({
      name: 'Sarah Connor',
      email: 'admin@contribhub.dev',
      passwordHash,
      role: 'admin',
      skills: ['Leadership', 'Community Management', 'Architecture'],
      interests: ['Open Source Ecosystems', 'Mentorship Quality'],
      isActive: true
    });

    // 2. Mentor
    const mentor = await User.create({
      name: 'David Chen',
      email: 'mentor@contribhub.dev',
      passwordHash,
      role: 'mentor',
      skills: ['React', 'Node.js', 'Express', 'TypeScript', 'Git Workflow'],
      interests: ['Web Performance', 'Testing', 'Developer Tooling'],
      isActive: true
    });

    // 3. Mentee
    const mentee = await User.create({
      name: 'Alex Rivera',
      email: 'mentee@contribhub.dev',
      passwordHash,
      role: 'mentee',
      skills: ['JavaScript', 'HTML5', 'CSS3', 'Git Basics'],
      interests: ['Frontend Dev', 'Documentation', 'CLI Tools'],
      isActive: true
    });

    // 4. Mentee 2
    const mentee2 = await User.create({
      name: 'Maya Patel',
      email: 'maya@contribhub.dev',
      passwordHash,
      role: 'mentee',
      skills: ['Python', 'Docker', 'REST APIs'],
      interests: ['Backend Services', 'Open Source DevOps'],
      isActive: true
    });

    // Mentorship Assignment
    await MentorshipAssignment.create({
      mentorId: mentor._id,
      menteeId: mentee._id,
      cohortName: 'Spring 2026 Open Source Cohort',
      startDate: new Date('2026-02-01'),
      status: 'active'
    });

    console.log('✅ Demo accounts seeded successfully:');
    console.log('   Admin:  admin@contribhub.dev  / Password123!');
    console.log('   Mentor: mentor@contribhub.dev / Password123!');
    console.log('   Mentee: mentee@contribhub.dev / Password123!');
    console.log('   Mentee: maya@contribhub.dev   / Password123!');
  } catch (err) {
    console.error('❌ Error seeding database:', err);
  }
};
