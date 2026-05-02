# 🔐 Access Manager

A full-stack **Enterprise Access Management** application built with **React** and **Node.js**, featuring role-based access control, user management, and a real-time audit log system.

![Node.js](https://img.shields.io/badge/Node.js-22.x-339933?style=flat&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?style=flat&logo=react&logoColor=black)
![MySQL](https://img.shields.io/badge/MySQL-8.4-4479A1?style=flat&logo=mysql&logoColor=white)
![MUI](https://img.shields.io/badge/MUI-v6-007FFF?style=flat&logo=mui&logoColor=white)
![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat&logo=express&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat&logo=jsonwebtokens&logoColor=white)

---

## ✨ Features

- 🔑 **JWT Authentication** — Secure login with token-based sessions (8h expiry)
- 👥 **User Management** — Full CRUD with role assignment, search, sort & pagination
- 🛡️ **Role-Based Access Control** — Admin/User roles with protected routes
- 📋 **Audit Log** — Every action is logged with user, timestamp and searchable history
- 🎨 **Modern UI** — Built with Material UI v6, responsive and clean design
- 🐛 **Dev Error Panel** — Real-time error overlay in development with SQL details and stack traces
- 🔒 **Password Hashing** — bcrypt with salt rounds
- 📁 **Error Logging** — Errors written to daily log files, separated by severity

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| React 19 | UI Framework |
| Material UI v6 | Component Library |
| React Router v6 | Client-side Routing |
| Vite | Build Tool & Dev Server |

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | REST API Server |
| MySQL 8.4 | Relational Database |
| JWT | Authentication |
| bcryptjs | Password Hashing |
| express-async-errors | Global Error Handling |

---

## 📁 Project Structure

```
accessmanager/
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── config/         # Database connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middlewares/    # Auth & error handling
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers
│   ├── .env.example
│   └── package.json
│
├── src/                    # React frontend
│   ├── components/         # Reusable components (DataTable, DevErrorPanel)
│   ├── pages/              # Page components
│   ├── utils/              # apiFetch utility
│   └── main.jsx
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- MySQL 8.x
- WAMP / XAMPP or any MySQL server

### 1. Clone the repository

```bash
git clone https://github.com/florentinmarianion/accessmanager.git
cd accessmanager
```

### 2. Setup the database

Import the SQL schema in phpMyAdmin or run:

```sql
CREATE DATABASE accessmanager CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Then import `database/schema.sql`.

### 3. Configure the backend

```bash
cd server
cp .env.example .env
```

Edit `.env`:

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASS=
DB_PORT=3306
DB_NAME=accessmanager
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

### 4. Install & run the backend

```bash
cd server
npm install
npm run dev
```

### 5. Install & run the frontend

```bash
cd ..
npm install
npm run dev
```

### 6. Login

```
URL:      http://localhost:5173
Username: admin
Password: admin
```

---

## 🔌 API Endpoints

### Auth
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/login` | Login & get JWT token | ❌ |
| GET | `/api/profile` | Get current user profile | ✅ |

### Users
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/users` | List all users | Admin |
| POST | `/api/users` | Create user | Admin |
| PUT | `/api/users/:id` | Update user | Admin |
| DELETE | `/api/users/:id` | Delete user | Admin |

### Roles
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/roles` | List all roles | ✅ |
| POST | `/api/roles` | Create role | Admin |
| PUT | `/api/roles/:id` | Update role | Admin |
| DELETE | `/api/roles/:id` | Delete role | Admin |

### Audit
| Method | Endpoint | Description | Auth |
|---|---|---|---|
| GET | `/api/audit` | Get audit log (last 200) | Admin |

---

## 🗄️ Database Schema

```
users
├── id (PK)
├── username (UNIQUE)
├── email (UNIQUE)
├── password (bcrypt)
├── first_name
├── last_name
├── phone
├── role_id (FK → roles.id)
├── created_at
└── updated_at

roles
├── id (PK)
├── name (UNIQUE)
├── created_at
└── updated_at

audit_log
├── id (PK)
├── user_id (FK → users.id)
├── username
├── action
└── created_at
```

---

## 🔐 Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- JWT tokens expire in **8 hours**
- All admin routes protected by **auth middleware**
- SQL injection prevented via **parameterized queries**
- Error stack traces hidden in **production mode**

---

## 🗺️ Roadmap

- [ ] Dashboard with statistics & charts
- [ ] User profile page & password change
- [ ] Pagination on server-side
- [ ] Dark mode
- [ ] Email notifications
- [ ] Docker support

---

## 👤 Author

**Florentin Marian Ion**  
[![GitHub](https://img.shields.io/badge/GitHub-florentinmarianion-181717?style=flat&logo=github)](https://github.com/florentinmarianion)

---

## 📄 License

This project is licensed under the MIT License.
