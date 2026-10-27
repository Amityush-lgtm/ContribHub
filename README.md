# ContribHub

**Open-Source Mentorship & Contribution Management Platform**

ContribHub is a MERN full-stack web application that helps open-source mentorship programmes manage contributions, mentor reviews, and participant tracking — all in one place.

---

## Features

### For Mentees
- **Automatic GitHub Sync**: Auto-fetch public Pull Requests and import them into ContribHub with pre-filled metadata and PR status
- Submit structured contribution records with repository links, problem/solution descriptions, tech stack, and evidence
- Track review status and read mentor feedback
- Edit or resubmit records when changes are requested
- View personal contribution history and progress summary

### For Mentors
- View assigned mentees and their contribution activity
- **Mentee GitHub Sync**: Refresh assigned mentees' GitHub activity and PR merge statuses on-demand
- Review queue with filtering by status (pending, approved, revisions, all)
- Approve, request changes, or reject contributions with detailed feedback
- Quick review modal for fast evaluations from the dashboard

### For Admins
- Programme-wide analytics dashboard with contribution pipeline breakdown
- User directory with search, role filtering, and status management
- Provision new user accounts with role-based permissions
- Create and manage mentor-mentee pairings across cohorts
- Full contribution audit across all participants

### Platform-Wide
- Automatic GitHub REST integration for Pull Request search and status sync
- JWT-based authentication with role-based access control
- User registration with role selection (mentee/mentor/admin)
- Profile management with GitHub username and skills
- Contribution detail pages with review history audit trail
- Search and filtering across all views
- Responsive glassmorphism dark-mode UI

---

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React 18, Vite, React Router v6     |
| Styling    | Custom CSS (dark glassmorphism)     |
| Icons      | Lucide React                        |
| Backend    | Node.js, Express                    |
| Database   | MongoDB + Mongoose                  |
| Auth       | JWT + bcrypt password hashing       |
| Dev DB     | MongoMemoryServer (auto-fallback)   |

---

## Quick Start (Development)

### Prerequisites
- **Node.js** v18+ and **npm**
- **MongoDB** (optional — the app auto-falls back to an in-memory database)

### 1. Clone the repository

```bash
git clone https://github.com/Amityush-lgtm/ContribHub.git
cd ContribHub
```

### 2. Install dependencies

```bash
# Install all (backend + frontend)
npm run install:all
```

Or install separately:
```bash
cd backend && npm install
cd ../frontend && npm install
```

### 3. Configure environment (optional)

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values. If you leave `MONGODB_URI` empty, the app automatically uses an in-memory MongoDB instance — perfect for quick development.

### 4. Start development servers

In two separate terminals:

```bash
# Terminal 1: Backend API (port 5000)
npm run dev:backend

# Terminal 2: Frontend (port 5173)
npm run dev:frontend
```

The frontend proxies API requests to the backend automatically via Vite.

### 5. Open the app

Visit **http://localhost:5173** in your browser.

### 6. Seed demo data (optional)

To populate the database with sample users, assignments, and contributions:

```bash
npm run seed
```

Or set `SEED_ON_START=true` in your `.env` and restart the backend.

---

## 🚀 Deploying to Vercel

ContribHub is configured for seamless monorepo deployment on **Vercel** via [`vercel.json`](file:///c:/Users/Amityush/Desktop/Lab/New%20folder/vercel.json) and serverless entrypoint [`api/index.js`](file:///c:/Users/Amityush/Desktop/Lab/New%20folder/api/index.js).

### Step-by-Step Vercel Deployment:

1. **Push your code to GitHub**:
   Ensure all changes are committed and pushed to your GitHub repository (`Amityush-lgtm/ContribHub`).

2. **Import Project into Vercel**:
   - Go to [vercel.com](https://vercel.com) and log in.
   - Click **"Add New..."** $\rightarrow$ **"Project"**.
   - Select your **`ContribHub`** repository and click **Import**.

3. **Configure Project Settings**:
   - **Framework Preset**: *Vite* (or *Other*)
   - **Root Directory**: `./` (leave as default root)
   - **Build Command**: `npm run build` (or leave default from `vercel.json`)
   - **Output Directory**: `frontend/dist` (pre-configured in `vercel.json`)

4. **Add Environment Variables**:
   Under **Environment Variables**, add the following:
   | Key | Value |
   |---|---|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A secure random string for signing JWTs |
   | `JWT_EXPIRES_IN` | `7d` |
   | `NODE_ENV` | `production` |
   | `GITHUB_TOKEN` | *(Optional)* Your GitHub personal access token for higher sync rate limits |

5. **Click Deploy**:
   Vercel will build the React SPA, deploy the serverless Express API at `/api`, and give you a live production URL (e.g. `https://contribhub.vercel.app`).

---

## Default Demo Accounts (after seeding)

| Role    | Email                   | Password       |
|---------|-------------------------|----------------|
| Admin   | admin@contribhub.dev    | Password123!   |
| Mentor  | mentor@contribhub.dev   | Password123!   |
| Mentee  | mentee@contribhub.dev   | Password123!   |
| Mentee  | maya@contribhub.dev     | Password123!   |

> You can also create new accounts from the login page using the **Create Account** tab.

---

## Production Deployment

### Build for production

```bash
# Build the frontend
npm run build

# Set environment to production
# In backend/.env:
#   NODE_ENV=production
#   MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>.mongodb.net/contribhub
#   JWT_SECRET=<strong-random-secret>

# Start the production server (serves both API + frontend)
npm run start
```

In production mode, the Express backend serves the React frontend from `frontend/dist/` — no separate frontend server needed.

### Deploy to Render / Railway / Fly.io

1. Set the **Root Directory** to the project root
2. **Build Command:** `npm --prefix frontend run build`
3. **Start Command:** `NODE_ENV=production node backend/src/server.js`
4. **Environment Variables:**
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = a strong random string (use `openssl rand -hex 32`)
   - `PORT` = (usually auto-set by the platform)

---

## API Endpoints

### Authentication
| Method | Route                | Description                  |
|--------|----------------------|------------------------------|
| POST   | `/api/auth/login`    | Login with email & password  |
| POST   | `/api/auth/register` | Create a new account         |
| POST   | `/api/auth/logout`   | Logout (clear session)       |
| GET    | `/api/auth/me`       | Get current user profile     |
| PATCH  | `/api/auth/profile`  | Update profile details       |

### Users (Admin only)
| Method | Route                | Description                  |
|--------|----------------------|------------------------------|
| GET    | `/api/users`         | List all users               |
| POST   | `/api/users`         | Provision a new user         |
| PATCH  | `/api/users/:id`     | Update user role/status      |
| DELETE | `/api/users/:id`     | Delete user and assignments  |

### Contributions
| Method | Route                           | Description                      |
|--------|---------------------------------|----------------------------------|
| POST   | `/api/contributions`            | Create a contribution            |
| GET    | `/api/contributions/mine`       | List current user's records      |
| GET    | `/api/contributions`            | List role-filtered records       |
| GET    | `/api/contributions/:id`        | Get contribution detail          |
| PATCH  | `/api/contributions/:id`        | Update contribution fields       |
| POST   | `/api/contributions/:id/submit` | Submit draft for review          |
| DELETE | `/api/contributions/:id`        | Delete a draft contribution      |
| POST   | `/api/contributions/:id/review` | Mentor: evaluate a submission    |

### Assignments (Admin only)
| Method | Route                    | Description                    |
|--------|--------------------------|--------------------------------|
| GET    | `/api/assignments`       | List role-filtered assignments |
| POST   | `/api/assignments`       | Create mentor-mentee pairing   |
| PATCH  | `/api/assignments/:id`   | Update assignment status       |
| DELETE | `/api/assignments/:id`   | Delete assignment              |

### Dashboards
| Method | Route                    | Description                    |
|--------|--------------------------|--------------------------------|
| GET    | `/api/dashboard/mentee`  | Mentee portfolio summary       |
| GET    | `/api/dashboard/mentor`  | Mentor review queue & mentees  |
| GET    | `/api/dashboard/admin`   | Programme-wide analytics       |

### Utility
| Method | Route           | Description              |
|--------|-----------------|--------------------------|
| GET    | `/api/health`   | Server health check      |

---

## Project Structure

```
ContribHub/
├── backend/
│   ├── src/
│   │   ├── config/          # Database connection (MongoDB / in-memory)
│   │   ├── controllers/     # Route handlers (auth, user, contribution, etc.)
│   │   ├── middleware/       # Auth (JWT), role guards, error handler
│   │   ├── models/          # Mongoose schemas (User, Contribution, Assignment)
│   │   ├── routes/          # Express route definitions
│   │   ├── app.js           # Express app setup, middleware, static serving
│   │   └── server.js        # Entry point, DB connection, server start
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, RoleLayout, ProtectedRoute, StatusBadge
│   │   ├── context/         # AuthContext (JWT, login, register, apiFetch)
│   │   ├── pages/           # All page components by role
│   │   │   ├── admin/       # AdminDashboard
│   │   │   ├── mentor/      # MentorDashboard
│   │   │   ├── mentee/      # MenteeDashboard, ContributionFormPage
│   │   │   └── contributions/ # ContributionDetailPage
│   │   ├── App.jsx          # Routes & role-based navigation
│   │   └── main.jsx         # React entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── package.json             # Root scripts (dev, build, deploy)
├── .gitignore
└── README.md
```

---

## Security Notes

- Passwords are hashed with **bcrypt** before storage
- Authentication uses **JWT tokens** (stored in localStorage and cookies)
- Every API route enforces **server-side role verification** — not just frontend guards
- Mentors can only review contributions from their **assigned mentees**
- Mentees cannot access other mentees' private records
- Admin operations are restricted to the `admin` role at the middleware level

---

## Phased Development

| Phase | Description                          | Status |
|-------|--------------------------------------|--------|
| 1     | Foundation & access control          | ✅     |
| 2     | Contribution management              | ✅     |
| 3     | Mentor review workflow               | ✅     |
| 4     | Admin management & dashboards        | ✅     |
| 5     | Testing, deployment & pilot          | ✅     |
| 6     | Enhancements after validation        | 🔜     |

---

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -m 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Open a Pull Request

---

## License

This project is open-source and available for educational and community use.
