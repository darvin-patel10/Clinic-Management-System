# 🏥 Clinic Management System

A full-stack, modern **Clinic Management System** designed to streamline clinic workflows, patient administration, medicine inventory management, and operational analytics. Built with the **MERN Stack** (MongoDB, Express, React, Node.js), Vite, and Tailwind CSS.

---

Visit :- https://clinic-management-system-djsx.vercel.app/

## 🌟 Key Features

### 🔐 **Authentication & Onboarding**
- **Multi-Step Clinic Registration**: Guided setup steps for clinic and admin details.
- **Secure JWT Authentication**: HTTP-only cookie-based tokens and session management.
- **Email OTP Verification**: Integrated with Nodemailer (OAuth2/Google API) for registration and password resets.

### 🩺 **Patient Management**
- Complete patient profile registration and medical history tracking.
- Filter, search, and manage patient appointments and consultation records.

### 💊 **Medicine & Inventory Management**
- Track medicine stock levels, expiry dates, and categories.
- Real-time inventory updates to prevent stockouts and overstocking.

### 📊 **Dashboard & Analytics**
- Real-time insights into clinic statistics, patient visits, and revenue/inventory metrics.
- Automated system activity logging for auditing.

### ⚙️ **Automated Background Jobs**
- Automated background maintenance powered by `node-cron` for cleanup and scheduled system tasks.

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: React Router v7
- **Form Management**: React Hook Form
- **Icons & UI**: Lucide React, React Toastify
- **HTTP Client**: Axios

### **Backend**
- **Runtime**: [Node.js](https://nodejs.org/) (ES Modules)
- **Framework**: [Express.js 5](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via Mongoose 9
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) + `cookie-parser`
- **Email Service**: `nodemailer` (Google OAuth2 integration)
- **Task Scheduler**: `node-cron`
- **Logger**: `morgan`

---

## 📁 Project Structure

```text
Clinic Management system/
├── Backend/
│   ├── src/
│   │   ├── config/          # Environment & Database Configuration
│   │   ├── controllers/     # Auth, Patient, Medicine, & Dashboard Logic
│   │   ├── middlewares/     # Auth Guards & Validation Middlewares
│   │   ├── models/          # Mongoose Data Schemas (User, Patient, Medicines, etc.)
│   │   ├── routes/          # API Endpoint Route Handlers
│   │   ├── services/        # Third-party Services (Email/Nodemailer)
│   │   └── utils/           # Cron jobs & Helper Utilities
│   ├── app.js               # Express Application Setup
│   ├── server.js            # Server Entry Point
│   ├── vercel.json          # Deployment Config
│   └── package.json
│
└── Frontend/
    ├── src/
    │   ├── component/       # Reusable UI & Auth Components
    │   ├── pages/           # Page Views (Dashboard, Patients, Medicines, Login)
    │   ├── routes/          # Frontend Route Definitions
    │   ├── service/         # API Integration Services
    │   ├── hooks/           # Custom React Hooks
    │   ├── App.jsx
    │   └── main.jsx
    ├── index.html
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites
Make sure you have the following installed on your system:
- **Node.js**
- **npm**
- **MongoDB** instance (local or MongoDB Atlas connection string)

---

### 1. Backend Setup

1. Navigate to the `Backend` directory:
   ```bash
   cd Backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Backend` root directory and populate the required environment variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/clinic_db
   JWT_SECRET=your_jwt_secret_key
   
   # Google OAuth / Nodemailer Credentials for OTP
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REFRESH_TOKEN=your_google_refresh_token
   GOOGLE_USER=your_email@gmail.com
   
   # Frontend URL Configuration
   CLIENT_URL=http://localhost:5173
   DEV_URL=http://localhost:5173
   ```

4. Start the backend development server:
   ```bash
   npm run dev
   ```
   The backend server will run on `http://localhost:5000`.

---

### 2. Frontend Setup

1. Open a new terminal and navigate to the `Frontend` directory:
   ```bash
   cd Frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `Frontend` root directory (if needed):
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Open your browser and visit `http://localhost:5173`.

---

## 📡 API Endpoints Summary

| Module | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Auth** | `/api/auth/register` | `POST` | Register user / clinic |
| **Auth** | `/api/auth/login` | `POST` | User login & JWT cookie issue |
| **Auth** | `/api/auth/verify-otp` | `POST` | Verify email OTP |
| **Patients** | `/api/patient` | `GET` | Fetch all patient records |
| **Patients** | `/api/patient` | `POST` | Create a new patient entry |
| **Medicines**| `/api/medicines` | `GET` | Fetch medicine inventory |
| **Medicines**| `/api/medicines` | `POST` | Add medicine to stock |
| **Dashboard**| `/api/dashboard` | `GET` | Retrieve clinic analytics & logs |

---

## ☁️ Deployment

The backend contains a `vercel.json` configuration for easy deployment on **Vercel** or any serverless Node.js host.

- **Backend Build Target**: Serverless Node.js execution on Vercel.
- **Frontend Build Target**: `npm run build` generates a production static bundle in `dist/` ready for Vercel, Netlify, or AWS S3/CloudFront.

---

## 📄 License

This project is open-source and available under the [ISC License](LICENSE).
