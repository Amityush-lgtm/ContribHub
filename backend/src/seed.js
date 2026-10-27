import dotenv from 'dotenv';
dotenv.config();

import User from './models/User.js';
import MentorshipAssignment from './models/MentorshipAssignment.js';
import Contribution from './models/Contribution.js';

export const seedDatabase = async () => {
  try {
    const userCount = await User.countDocuments();
    let mentee;

    if (userCount === 0) {
      console.log('Seeding demo accounts for ContribHub...');

      const defaultPassword = 'Password123!';
      const passwordHash = await User.hashPassword(defaultPassword);

      // 1. Admin
      await User.create({
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
      mentee = await User.create({
        name: 'Alex Rivera',
        email: 'mentee@contribhub.dev',
        passwordHash,
        role: 'mentee',
        skills: ['JavaScript', 'HTML5', 'CSS3', 'Git Basics'],
        interests: ['Frontend Dev', 'Documentation', 'CLI Tools'],
        isActive: true
      });

      // 4. Mentee 2
      await User.create({
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

      console.log('Demo accounts seeded successfully:');
      console.log('   Admin:  admin@contribhub.dev  / Password123!');
      console.log('   Mentor: mentor@contribhub.dev / Password123!');
      console.log('   Mentee: mentee@contribhub.dev / Password123!');
      console.log('   Mentee: maya@contribhub.dev   / Password123!');
    } else {
      mentee = await User.findOne({ email: 'mentee@contribhub.dev' });
    }

    // Seed sample contribution for Phase 2 if none exist
    const contributionCount = await Contribution.countDocuments();
    if (contributionCount === 0 && mentee) {
      console.log('Seeding initial demo contribution for Alex Rivera...');
      await Contribution.create({
        menteeId: mentee._id,
        projectName: 'express-rate-limiter',
        repositoryUrl: 'https://github.com/expressjs/rate-limiter-flexible',
        title: 'Fix unhandled promise rejection during Redis cluster reconnection',
        summary: 'Prevents Express server crash when the Redis cluster undergoes a leader failover.',
        contributionType: 'bug_fix',
        issueUrl: 'https://github.com/expressjs/rate-limiter-flexible/issues/412',
        pullRequestUrl: 'https://github.com/expressjs/rate-limiter-flexible/pull/489',
        technologies: ['TypeScript', 'Redis', 'Jest', 'Node.js'],
        problemSolved: 'When the Redis primary node transitioned, reconnection events emitted unhandled promise rejections which terminated the Node.js process under strict rejection handling.',
        solutionDescription: 'Wrapped the cluster reconnect promise handler in an exponential backoff loop with safe error interceptors, and added an event emitter cleanup listener.',
        validation: 'Added 4 unit test cases with a mock Redis cluster simulating disconnect, election latency, and reconnect states. All 4 tests passed in CI.',
        outcome: 'Server uptime maintained across Redis failovers without dropping active HTTP sessions.',
        evidenceUrls: [
          'https://github.com/expressjs/rate-limiter-flexible/pull/489',
          'https://github.com/expressjs/rate-limiter-flexible/actions/runs/128493012'
        ],
        reviewStatus: 'submitted',
        pullRequestStatus: 'open'
      });
      console.log('Sample contribution record seeded.');
    }
  } catch (err) {
    console.error('[ERROR] Error seeding database:', err);
  }
};

if (process.argv[1]?.replace(/\\/g, '/').endsWith('src/seed.js')) {
  import('./config/db.js').then(async ({ connectDB, closeDB }) => {
    await connectDB();
    await seedDatabase();
    await closeDB();
    process.exit(0);
  });
}
