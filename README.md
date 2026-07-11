# Clarior CRM

> **Production-grade SaaS CRM** — built with React 19, Node.js, Express, and Neon Serverless PostgreSQL

![Clarior CRM](https://img.shields.io/badge/Clarior-CRM-cyan?style=for-the-badge&logo=zap)
![React](https://img.shields.io/badge/React-19-blue?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-green?style=flat-square&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-purple?style=flat-square&logo=postgresql)
![WebSockets](https://img.shields.io/badge/WebSockets-Realtime-orange?style=flat-square&logo=websocket)

---

## 🚀 Overview

**Clarior CRM** is a full-stack, recruiter-grade Customer Relationship Management system built to replicate the user experience of modern SaaS products like Notion, Linear, HubSpot, and Monday.com. 

It combines a high-performance React frontend featuring Tailwind v4 styling with a secure Express backend powered by Neon cloud database.

---

## ✨ Upgraded Features

### 🤖 AI CRM Assistant (Gemini & Heuristic Engine)
- Context-aware summaries of customer interaction histories, notes, associated tasks, and sales opportunities.
- Actionable follow-up recommendations and next steps.
- Uses **Gemini 2.5 Flash** with a robust local **Heuristic Fallback Engine** to ensure high-quality mock data when API keys are not provided.

### 🔌 Real-Time WebSockets Notifications
- Uses the `ws` library for low-latency, bi-directional communication.
- Instantly pushes in-app bell notifications and interactive toast alerts when tasks or leads are assigned, updated, or completed.
- Authenticated WebSocket upgrade requests verified via URL-query JWT validation.

### ⌨️ Command Palette (`Ctrl+K`)
- Omnibar search modal accessible globally from anywhere in the app using keyboard shortcuts (`Ctrl+K` or `/`).
- Performs debounced concurrent API queries across customers, leads, and tasks, alongside settings page routing and light/dark theme toggling.
- Supports complete keyboard navigation (`ArrowUp`, `ArrowDown`, `Enter`, `Escape`).

### 📅 Custom Interactive Calendar
- Bespoke monthly calendar built from scratch in React.
- Maps task cards dynamically to dates based on due dates.
- Features high, medium, and low priority indicators.
- Day cells trigger a detail panel showing assigned members, priorities, and statuses.

### 👥 Customer Notes & Timeline
- Sub-tabs for logging notes with author profiles and timestamps.
- Vertical interactive Activity Log timeline tracking account modifications, lead updates, and completed actions.

### 🔄 Data Import / Export & Column Sorting
- Dynamic column-header sorting on the customers list (Name, Email, Company, Added Date, Status).
- Client-side CSV parser that processes file uploads and bulk-inserts records.
- Standard CSV exporter to back up current customer lists.

### 🛡️ Security & Validation Guards
- **Joi validation middleware** validating requests (registration, login, customers, leads, tasks, notes) before database execution.
- Stricter rate-limiting policies configured on authentication endpoints to prevent brute-force attacks.
- Persists user dark/light mode preferences directly to the PostgreSQL profile records.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 + Vite |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **Charts** | Recharts |
| **Routing** | React Router v7 |
| **Backend** | Node.js + Express |
| **Database** | Neon Serverless PostgreSQL |
| **Realtime** | WebSockets (`ws` package) |
| **Validation**| Joi Schemas |
| **Security** | Helmet, Express Rate Limiter, CORS |

---

## 💻 Local Setup & Installation

### Prerequisites
- Node.js (v18 or higher)
- A Neon PostgreSQL Database connection URL

### 1. Clone the repository and install dependencies
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the `server` directory using the provided template:
```bash
cp server/.env.example server/.env
```
Fill in the variables inside `server/.env`:
```env
PORT=5000
DATABASE_URL=your_neon_postgresql_url
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_optional_gemini_api_key
FRONTEND_URL=http://localhost:5173
```

### 3. Run Database Initialization
Open the Settings panel inside the Clarior CRM web app and click **Run Setup** under Database, or execute:
```bash
npm run dev --prefix server
# Calls the database setup script to structure tables automatically on start.
```

### 4. Run Development Servers
```bash
# Start backend (port 5000)
npm run dev --prefix server

# Start frontend (port 5173)
npm run dev --prefix client
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing

The API includes a self-contained test suite that verifies JWT session verification, Joi schema validation guards, and database queries.

Run the test suite:
```bash
npm run test --prefix server
```

---

## ☁️ Vercel Deployment

Clarior CRM is fully configured for deployment on the Vercel platform as a single monorepo.

### Step-by-Step Deployment Guide:
1. **Connect Repository**: Import your Clarior CRM repository into Vercel.
2. **Configure Root Directory**: Leave the root directory as the default (root `/` of your repository). Vercel will automatically read the `vercel.json` file.
3. **Environment Variables**: In your Vercel project settings, add the following variables:
   - `DATABASE_URL`: Your Neon PostgreSQL connection URL.
   - `JWT_SECRET`: A secure key for token signing.
   - `GEMINI_API_KEY`: (Optional) Your Gemini API key for AI assistant features.
4. **Deploy**: Click **Deploy**. Vercel will build the React app and spin up serverless node endpoints automatically!