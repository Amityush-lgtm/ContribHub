# ContribHub — Open-Source Mentorship & Contribution Management

> **Phase 1: Foundation and Access Control — COMPLETED**

ContribHub is a full-stack MERN application for open-source mentorship programmes (e.g., college OSC clubs, developer communities). It provides structured tracking of contributions, mentor feedback loops, and administrative cohort governance.

---

## 🌟 Phase 1 Deliverables & Architecture

| Component | Technology | Implementation Details |
| :--- | :--- | :--- |
| **Backend API** | Node.js + Express (ES Modules) | Port `5000`, `/api` prefix, RESTful endpoints |
| **Database** | MongoDB + Mongoose | Robust models (`User`, `MentorshipAssignment`, `Contribution`), automatic in-memory DB fallback for out-of-the-box local execution |
| **Authentication** | JWT + bcryptjs | Token-based authentication, password hashing, 7-day expiration |
| **Security & RBAC** | Express Middleware | Server-side role checks (`requireAuth`, `requireRole('admin' | 'mentor' | 'mentee')`) preventing cross-role access |
| **Frontend** | React 18 + Vite | Port `5173`, responsive modern glassmorphic UI, custom CSS design system |
| **Routing** | React Router DOM | Protected route guards, unauthorized (403) handling, role-specific layouts |

---

## 👥 Seeded Demo Credentials

When the backend starts up, demo accounts are automatically seeded into the database:

| Role | Name | Email | Password | Access Area |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | Sarah Connor | `admin@contribhub.dev` | `Password123!` | `/admin/dashboard` |
| **Mentor** | David Chen | `mentor@contribhub.dev` | `Password123!` | `/mentor/dashboard` |
| **Mentee** | Alex Rivera | `mentee@contribhub.dev` | `Password123!` | `/mentee/dashboard` |
| **Mentee 2** | Maya Patel | `maya@contribhub.dev` | `Password123!` | `/mentee/dashboard` |

> In the frontend UI, one-click demo chips allow instant filling and quick-switching between roles.

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
*Note: If `MONGODB_URI` is not set in `backend/.env`, an automatic In-Memory MongoDB server starts seamlessly.*

### 2. Start Frontend App
```bash
cd frontend
npm run dev
# Vite dev server will run on http://localhost:5173
```

---

## 🛡️ Role-Based Access Control Verification

- **Admin (`/admin/dashboard`):**
  - View overall platform metrics (Total Users, Mentors, Mentees, Active Pairings).
  - Provision new users with role assignment (`mentee`, `mentor`, `admin`).
  - Search and filter users by role and name.
  - Pair mentors and mentees with cohort naming.
  - Activate or deactivate accounts.

- **Mentor (`/mentor/dashboard`):**
  - Server-restricted query returning *only* their assigned mentees (`/api/users/my-mentees`).
  - View mentee technical skills, interests, and pairing dates.
  - Mentorship assessment criteria (Plan §4 guidance).

- **Mentee (`/mentee/dashboard`):**
  - View assigned mentor card with contact details and skills.
  - Contribution status pipeline preview (Draft ➔ Submitted ➔ Changes Requested ➔ Approved).
  - Update personal profile, skills, and areas of interest (`/profile`).

- **Permission Enforcement:**
  - Direct URL access to unauthorized dashboards is intercepted by `ProtectedRoute` and redirected to `/unauthorized` (403).
  - Direct API calls to unauthorized endpoints return HTTP `403 Forbidden` from the Express layer.

---

## 📋 Next Phase: Phase 2 (Contribution Management)
- Contribution record model CRUD routes (`/api/contributions`)
- Form for structured contribution fields (Problem solved, Solution description, Verification/tests, Evidence links, PR status)
- Mentee contribution list and status tracking
