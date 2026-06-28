# Clarior CRM

> **Production-ready SaaS CRM** — built with React, Node.js, and Neon PostgreSQL

![Clarior CRM](https://img.shields.io/badge/Clarior-CRM-cyan?style=for-the-badge&logo=zap)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-purple?style=flat-square&logo=postgresql)

---

## 🚀 Overview

**Clarior CRM** is a full-stack, production-quality Customer Relationship Management system designed for SaaS teams, startups, and portfolio demonstrations. It combines the power of a modern React frontend with a secure Node.js backend and cloud PostgreSQL database.

---

## ✨ Features

### 📊 Dashboard
- Live stats cards (Revenue, Customers, Leads, Tasks)
- Revenue trends chart (Recharts)
- Customer growth chart
- Lead sources pie chart
- Task completion ring chart
- Recent activity feed
- Latest customers widget
- Upcoming tasks widget
- Quick action buttons

### 👥 Customers
- Full CRUD operations
- Search & filter by status
- Paginated table view
- CSV export
- Status badges

### 🎯 Leads & Pipeline
- Drag-and-drop Kanban pipeline view
- Traditional list view with pagination
- Lead stages: New → Contacted → Qualified → Won → Lost
- Priority tracking
- Assignee management

### ✅ Tasks
- Drag-and-drop Kanban board (Todo → In Progress → Done)
- List view with pagination
- Priority, due date, category tracking
- Completion status

### 📈 Reports & Analytics
- Revenue charts by year
- Customer growth analysis
- Lead conversion stats
- Task completion breakdown
- Top customers table

### 🔐 Authentication & Security
- JWT-based authentication (7-day tokens)
- Email verification (Nodemailer / Ethereal)
- Password reset via email
- Account lockout after 5 failed attempts (15-min lock)
- Role-based access control (RBAC)
- Rate limiting on auth endpoints
- Helmet.js security headers
- CORS protection

### 👤 User Profiles
- Full profile editing (bio, location, company, etc.)
- Avatar upload with image preview
- Profile completion percentage
- Social links (LinkedIn, GitHub, website)
- Timezone & language preferences

### 🛡️ Admin Panel
- User management table
- Create, edit, deactivate users
- Role assignment (Employee, Manager, Admin, Super Admin)
- Admin-only route protection

### 🔔 Notifications
- Real-time polling (10-second interval)
- Mark individual/all as read
- Delete notifications
- Badge count on bell icon

### 🌙 Theme
- Dark/Light mode toggle
- Zero-flicker theme loading (script in `<head>`)
- Smooth CSS transitions

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite |
| Styling | Tailwind CSS v4 |
| Routing | React Router v7 |
| HTTP Client | Axios (with auth interceptor) |
| Charts | Recharts |
| Icons | Lucide React |
| Drag & Drop | @hello-pangea/dnd |
| Backend | Node.js + Express v5 |
| Database | Neon PostgreSQL (serverless) |
| Auth | JWT + bcryptjs |
| Email | Nodemailer (Ethereal) |
| File Upload | Multer |
| Security | Helmet + CORS + express-rate-limit |

---

## 📁 Project Structure

```
Clarior/
├── client/                   # React frontend (Vite)
│   └── src/
│       ├── api/api.js         # Axios instance + all services
│       ├── components/        # Reusable UI components
│       │   ├── charts/        # Recharts chart components
│       │   ├── leads/         # Lead modal
│       │   ├── tasks/         # Task modal
│       │   ├── ui/            # ConfirmDialog, StatusBadge, etc.
│       │   └── widgets/       # Dashboard widgets
│       ├── context/           # React contexts (Auth, Theme, Toast)
│       ├── layouts/           # MainLayout (Sidebar + Topbar + Outlet)
│       ├── pages/             # Page components
│       │   └── auth/          # Login, Register, etc.
│       └── routes/            # AppRoutes with ProtectedRoute
│
└── server/                   # Node.js backend
    ├── controllers/           # Business logic
    ├── db/                    # Neon connection + setup.js
    ├── middleware/            # Auth + Security middleware
    ├── routes/                # Express routers
    └── utils/                 # Email, logger, upload utilities
```

---

## 🔧 Setup & Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- A [Neon PostgreSQL](https://neon.tech) database (free tier works)

### 1. Clone & Install

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 2. Configure Environment

Create `server/.env`:
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173
DATABASE_URL=your_neon_database_url_here
```

### 3. Initialize Database

The database tables are automatically created when the server starts. You can also trigger it manually:
```
POST http://localhost:5000/setup-db
```

### 4. Default Admin Account

After setup, a default Super Admin is created:
- **Email:** `admin@clarior.com`
- **Password:** `Admin123!`

> ⚠️ Change the password immediately after first login!

### 5. Run Development Servers

```bash
# Terminal 1 — Backend
cd server && npm run dev

# Terminal 2 — Frontend
cd client && npm run dev
```

Frontend: http://localhost:5173  
Backend API: http://localhost:5000

---

## 🔑 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **Super Admin** | Full access including Admin Panel |
| **Admin** | Full access including Admin Panel |
| **Manager** | CRUD on all entities, no user management |
| **Employee** | CRUD on customers/leads/tasks, no delete |

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user (protected) |
| POST | `/api/auth/verify-email` | Verify email token |
| POST | `/api/auth/forgot-password` | Request reset link |
| POST | `/api/auth/reset-password` | Reset password |

### Customers, Leads, Tasks
- Standard CRUD at `/customers`, `/leads`, `/tasks`
- All protected by JWT middleware
- Kanban status update: `POST /leads/batch-status`, `POST /tasks/batch-status`

### Users (Admin only)
- `GET/POST /api/users` — list / create users
- `PUT/DELETE /api/users/:id` — update / delete user
- `PUT /api/users/me` — update own profile
- `POST /api/users/avatar` — upload avatar

### Notifications
- `GET /api/notifications` — list user notifications
- `PUT /api/notifications/:id/read` — mark read
- `PUT /api/notifications/read-all` — mark all read
- `DELETE /api/notifications/:id` — delete

---

## 🎨 Design Highlights

- **Glassmorphic cards** with subtle borders
- **Gradient accents** (cyan/violet/fuchsia)
- **Smooth 300ms transitions** on all interactive elements
- **Skeleton loading** states for tables and cards
- **Drag-and-drop** with visual feedback on hover/drag
- **Custom scrollbars** styled per theme
- **Mobile-responsive** layout

---

## 🤝 Contributing

This project was built as a portfolio/internship demonstration. Feel free to fork and extend!

---

*Built with ❤️ using React + Node.js + Neon PostgreSQL*