# ContribHub — Open-Source Mentorship & Contribution Management

[![GitHub Repository](https://img.shields.io/badge/GitHub-Amityush--lgtm%2FContribHub-blue?logo=github)](https://github.com/Amityush-lgtm/ContribHub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Phase 1: Foundation and Access Control — COMPLETED**  
> **Phase 2: Contribution Management — COMPLETED**  
> **Phase 3: Mentor Review & Evaluation Workflow — COMPLETED**  
> **Phase 4: Admin Governance & Dashboards — COMPLETED**

ContribHub is a modern full-stack MERN application designed for open-source mentorship programmes (e.g. college open-source clubs, developer communities). It provides structured tracking of contributions, mentor evaluation workflows, and administrative cohort governance.

GitHub remains the source of truth for code, issues, commits, and pull requests. ContribHub provides the structured mentorship and reporting layer around that work.

---

## 🌟 Architecture & Completed Phases

### Phase 1: Foundation & RBAC
- **Authentication**: JWT token-based authentication and secure `bcryptjs` password hashing.
- **Account Registration & Login**: Users can register as Mentees or Mentors with their GitHub usernames, skills, and interests.
- **Role-Based Access Control**: Server-enforced role restrictions across `Admin`, `Mentor`, and `Mentee`.
- **Database**: Mongoose models (`User`, `MentorshipAssignment`, `Contribution`) with graceful fallback to MongoMemoryServer for development.
- **Frontend Core**: React 18 + Vite, custom glassmorphic CSS design system, Google Fonts (*Outfit* and *Plus Jakarta Sans*), and `ProtectedRoute` guard with 403 / 404 handling.

### Phase 2: Contribution Management
- **Structured Contribution Records**:
  - Title, short summary, repository name, repository URL.
  - Pull Request URL, Issue URL, and actual GitHub PR status (`open`, `review_requested`, `merged`, `closed`).
  - Contribution type (`bug_fix`, `feature`, `documentation`, `testing`, `refactoring`, `research`, `other`).
  - Technologies & frameworks used.
  - Technical problem solved & architectural solution implemented.
  - Validation checks performed (test suites, benchmarks, verification).
  - Outcome / impact & evidence links.
- **Workflow & Lifecycle**:
  - `Draft` ➔ `Submitted` ➔ `Changes Requested` ➔ `Approved` / `Rejected`.
  - Mentees can save drafts, edit existing drafts or revisions, submit records for mentor review, and delete drafts.
- **Role-Aware Scoping & Inspection**:
  - Mentees only see and manage their own submissions.
  - Mentors only see submissions from mentees assigned to their cohort.
  - Admins can monitor cohort-wide activity.

### Phase 3: Mentor Review & Evaluation Workflow
- **Mentor Evaluation Actions**:
  - `POST /api/contributions/:id/review`: Assigned mentors or administrators can evaluate submissions with choices:
    - **Approve**: Marks contribution validated for programme tracking.
    - **Request Changes**: Requires constructive feedback and returns record to the mentee for revision.
    - **Reject with Reason**: Records formal rejection rationale.
- **Audit History & Timestamps**:
  - Every review action records `reviewedBy`, `reviewedAt`, `mentorFeedback`, and appends to an auditable `reviewHistory` timeline.
- **Interactive Review UI**:
  - Contribution details page includes a dedicated **Mentor Evaluation Panel** for reviewing code problem, solution, validation, and evidence links.
  - Quick Evaluation modal directly on the Mentor Dashboard.
  - Status pipeline filters on Mentor Dashboard: Pending Review, Approved, Revisions Requested, All.
  - Real-time mentee revision alert banner guiding mentees to edit and resubmit revised records.

### Phase 4: Admin Governance & Dashboards
- **Cohort Analytics & Overview**:
  - Centralized `/api/dashboard/admin` analytics API returning user distribution, active cohorts, contribution pipelines, and contribution type distributions.
  - Visual summary cards and recent cohort activity feed.
- **User Provisioning & Role Management**:
  - Admin directory with live search by name, email, or GitHub username.
  - Role filters (`Admin`, `Mentor`, `Mentee`) and status filters (`Active`, `Inactive`).
  - Provision User modal to create accounts with custom credentials and roles.
  - Edit User modal to update roles, GitHub handles, or activate/deactivate accounts.
  - Safe user deletion that cleans up orphaned assignments.
- **Mentorship Pairing Management**:
  - Interface to assign mentees to mentors with custom cohort names.
  - Toggle pairing status (`active` ➔ `completed`) or delete pairings.
- **Cohort Submissions Inspector**:
  - Platform-wide inspection table with status and keyword filters allowing administrators to audit all records.

---

## 🚀 Running the Project

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Start Backend API
```bash
cd backend
npm run dev
# Server will run on http://localhost:5000
```
*Note: If MongoDB Atlas connection is configured in `backend/.env`, it will connect securely. If no URI is provided, an automatic In-Memory MongoDB server starts seamlessly.*

### 2. Start Frontend App
```bash
cd frontend
npm run dev
# Vite dev server will run on http://localhost:5173
```

---

## 👥 User Accounts & Testing

- **Sign In / Create Account**: Visit `http://localhost:5173/login` to sign in or register with your name, email, password, role, and GitHub username.
- **Optional Demo Seeding**: If you want to seed sample demo accounts (Admin, Mentor, Mentee) and a demo contribution for testing, run:
  ```bash
  cd backend
  node src/seed.js
  ```

---

## 📋 Next Phase: Phase 5 (Testing, Deployment & Pilot)
- Access-control edge case tests and validation checks.
- Deployment configuration (Render / Railway / Vercel).
- Pilot testing with a small mentor-mentee group.
