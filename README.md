# GeoFleet 🚛🌍

GeoFleet is a robust, full-stack logistics and fleet management system built with Node.js (Express), React (Vite), and PostgreSQL (PostGIS). It is designed to manage hubs, track vehicles and drivers in real-time, and dispatch shipments with role-based access control (Admin, Dispatcher, Driver).

## 🗂️ Project Structure

The repository is modularized into a `frontend` and a `backend`:

```text
GeoFleet/
├── backend/
│   ├── package.json
│   ├── schema.sql         # Main database schema (PostgreSQL + PostGIS)
│   ├── seed.sql           # Initial database seeding script
│   └── src/
│       ├── app.js         # Express app configuration
│       ├── server.js      # Main backend entry point
│       ├── config/        # Environment and Database connection settings
│       ├── middleware/    # Auth (JWT) & RBAC middlewares
│       ├── modules/       # Domain modules (Assign, Auth, Drivers, Hubs, Shipments, Trips)
│       └── utils/         # API response utilities & Async wrappers
└── frontend/
    ├── package.json
    ├── tailwind.config.js # Styling configurations
    ├── vite.config.js     # Vite bundler configurations
    └── src/
        ├── api/           # Axios clients and API route handlers
        ├── components/    # Reusable UI components & FleetMap MapBox/Leaflet wrapper
        ├── context/       # React Context (Auth)
        └── pages/         # Role-based Dashboards (Admin, Dispatcher, Driver, Login, Register)
```

## 🚀 Installation & Setup Guide

### 1. Prerequisites
- **Node.js**: v16+
- **PostgreSQL**: v14+ with the **PostGIS** extension installed.
- **Git**: For version control.

### 2. Database Setup

1. Open your PostgreSQL CLI (like `psql`) or a DBMS tool like pgAdmin/DBeaver.
2. Create the database:
   ```sql
   CREATE DATABASE geofleet_db;
   \c geofleet_db
   ```
3. Run the `schema.sql` file to create tables, extensions, and spatial indexes:
   ```bash
   psql -U postgres -d geofleet_db -f backend/schema.sql
   ```

### 3. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `backend` folder:
   ```env
   PORT=5000
   DB_USER=postgres
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=geofleet_db
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the backend development server:
   ```bash
   npm run dev
   ```

### 4. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `frontend` folder:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```

---

## 🛢️ Database Seeding

To quickly test the application across different roles, a sample seeding SQL script has been written at `backend/seed.sql`. This script injects Hubs, Users, Vehicles, Drivers, and initial Shipments into your database.

### The Seeding Process
1. Make sure your database has the schema loaded via `schema.sql`.
2. Run the `seed.sql` script into your target database:
   ```bash
   psql -U postgres -d geofleet_db -f backend/seed.sql
   ```

### Sample Users Generated
All seed users have the default password: `password123`

| Role          | Email                              | Password      | Description                       |
|---------------|------------------------------------|---------------|-----------------------------------|
| **Fleet Admin** | `admin@geofleet.com`              | `password123` | Full access across all hubs.      |
| **Dispatcher**  | `dispatcher.mumbai@geofleet.com`  | `password123` | Scoped to Mumbai Central Depot.   |
| **Dispatcher**  | `dispatcher.delhi@geofleet.com`   | `password123` | Scoped to Delhi North Hub.        |
| **Driver**      | `driver.john@geofleet.com`        | `password123` | Van driver registered at Mumbai.  |
| **Driver**      | `driver.sam@geofleet.com`         | `password123` | Bike driver registered at Delhi.  |
| **Driver**      | `driver.auto[4-25]@geofleet.com`  | `password123` | 22 additional drivers auto-mapped.|

---

## 👨‍💻 Author

<a href="https://github.com/Sahil-2005" target="_blank"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white" alt="GitHub"/></a>
<a href="https://www.linkedin.com/in/sahil-gawade-920a0a242/" target="_blank"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn"/></a>
<a href="mailto:gawadesahil.dev@gmail.com" target="_blank"><img src="https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white" alt="Email"/></a>
<a href="https://leetcode.com/u/sahilgawade4321/" target="_blank"><img src="https://img.shields.io/badge/LeetCode-FFA116?style=for-the-badge&logo=leetcode&logoColor=black" alt="Leetcode"/></a>
<a href="https://sahil-gawade.vercel.app/" target="_blank"><img src="https://img.shields.io/badge/Portfolio-2563EB?style=for-the-badge&logo=vercel&logoColor=white" alt="Portfolio"/></a>
