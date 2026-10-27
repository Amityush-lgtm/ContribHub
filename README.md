# ContribHub — Open-Source Mentorship & Contribution Management

[![GitHub Repository](https://img.shields.io/badge/GitHub-Amityush--lgtm%2FContribHub-blue?logo=github)](https://github.com/Amityush-lgtm/ContribHub)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Phase 1: Foundation and Access Control — COMPLETED**  
> **Phase 2: Contribution Management — COMPLETED**

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
- **Interactive UI**:
  - Mentee dashboard with dynamic status pipeline cards, search, and status filters.
  - Contribution creation/edit form (`/mentee/contributions/new` and `/mentee/contributions/edit/:id`).
  - Full technical report inspection page (`/contributions/:id`) with mentor feedback preview and evidence links.
  - Mentor dashboard review queue displaying incoming cohort submissions.

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

## 👥 Getting Started & User Accounts

- **Sign In / Create Account**: Visit `http://localhost:5173/login` to sign in or create a new account with your name, email, password, and GitHub username.
- **Optional Demo Seeding**: If you want to seed sample demo accounts and a demo contribution for testing, run:
  ```bash
  cd backend
  node src/seed.js
  ```

---

## 📋 Next Phase: Phase 3 (Mentor Review Workflow)
- Mentor review queue action buttons: **Approve**, **Request Changes**, **Reject with Reason**.
- Feedback and guidance entry modal / inline form with suggested next steps.
- Real-time status update visible to mentee for revisions.
- Audit timestamps (`reviewedAt`, `reviewedBy`).
