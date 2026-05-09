# 🔁 CodeLoop - Smart LeetCode Revision Tracker

A full-stack application to track LeetCode problems and schedule smart revisions using the **SM-2 spaced repetition algorithm**.

---

## ✨ Features

- 🔐 JWT Authentication (Register/Login)  
- ➕ Add & manage solved problems with topic, difficulty, and notes  
- 🔁 Smart revision scheduling (SM-2 algorithm)  
- 📊 Dashboard with topic distribution & difficulty analytics  
- 🔍 Filter problems by topic, difficulty, and search  
- 📱 Fully responsive modern dark UI  

---

## 🏗️ 🛠️ Tech Stack & Infrastructure

### Frontend
- **React.js** – Modern UI development
- **Vite** – Fast frontend build tool
- **JavaScript (ES6+)** – Application logic
- **Tailwind CSS** – Responsive UI styling
- **Axios** – API communication
- **React Router DOM** – Client-side routing

### Backend
- **Node.js** – Server runtime
- **Express.js** – REST API development
- **JWT (JSON Web Tokens)** – Secure authentication
- **bcrypt.js** – Password hashing & security
- **Nodemailer** – Email service integration

### Database
- **MySQL** – Relational database management
- **Railway** – Cloud database hosting

### Authentication & Security
- **Email OTP Verification**
- **Google OAuth Authentication**
- **Password Encryption**
- **Session Token Management**

### Email Infrastructure
- **Brevo SMTP** – Transactional email delivery for OTP verification

### Cloud Deployment
- **Vercel** – Frontend hosting
- **Render** – Backend hosting
- **Railway** – Managed MySQL database

### Monitoring & Reliability
- **UptimeRobot** – Backend uptime monitoring & keep-alive checks

### Development Tools
- **Visual Studio Code**
- **Git & GitHub**
- **Postman**
---
## 🤖 AI-Powered Premium Features (Planned)

CodeRecall is designed to evolve into an AI-powered interview preparation platform with premium intelligent learning features.

### AI Coding Assistant
Premium users will get access to an advanced AI coding mentor that can:
- Solve LeetCode problems step-by-step
- Explain optimal approaches in simple language
- Compare brute-force vs optimized solutions
- Suggest better algorithms and data structures
- Reduce **Time Complexity** and **Space Complexity**
- Provide clean production-ready code implementations

### Smart Interview Intelligence
AI will help users with:
- Company-wise frequently asked coding questions
- Interview pattern analysis for top companies
- Personalized DSA preparation roadmaps
- Topic-wise weak area detection
- Smart difficulty progression recommendations

### Intelligent Revision Engine
Future AI revision system will:
- Track solved questions and learning behavior
- Recommend the exact time for revision
- Use spaced repetition concepts for retention
- Prioritize weak and high-value interview questions
- Generate personalized revision schedules

### Premium Learning Features
- AI-based mock coding interviews
- Real-time code review & optimization suggestions
- Personalized interview preparation dashboard
- Company-specific problem recommendations
- AI-generated hints instead of direct solutions
- Resume-to-DSA preparation recommendations
---

## 🚀 Getting Started

### 📌 Prerequisites

- Node.js ≥ 18  
- MySQL installed & running  

---

### 1️⃣ Clone & Install

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install

### 2️⃣ Configure Environment

### 📁 backend/.env

PORT=5000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME= your_database_name

JWT_SECRET=your_generated_secret

###  📁 frontend/.env

VITE_API_URL=http://localhost:5000/api

----

### 3️⃣ Run the App

# Terminal 1 — Backend
cd backend
npm run dev

# Terminal 2 — Frontend
cd frontend
npm run dev

Open: http://localhost:5173

----

### 📁 Project Structure

code-loop/
├── backend/
│   ├── config/db.js
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.js
└── frontend/
    └── src/
        ├── api/
        ├── components/
        ├── context/
        └── pages/

----

###  🔁 SM-2 Spaced Repetition

After reviewing a problem, rate your recall (0–5):

| Rating | Meaning                          |
| ------ | -------------------------------- |
| 0–1    | Failed → Reset                   |
| 2–3    | Hard → Short interval            |
| 4–5    | Good/Perfect → Increase interval |


👉 Automatically updates:

ease_factor
interval_days
next_review_date


-----

### 📡 API Endpoints

| Method | Endpoint                 | Description      |
| ------ | ------------------------ | ---------------- |
| POST   | /api/auth/register       | Register         |
| POST   | /api/auth/login          | Login            |
| GET    | /api/problems            | Get all problems |
| POST   | /api/problems            | Add problem      |
| PUT    | /api/problems/:id        | Update problem   |
| DELETE | /api/problems/:id        | Delete problem   |
| GET    | /api/problems/due        | Due problems     |
| POST   | /api/problems/:id/review | Submit review    |
| GET    | /api/dashboard           | Dashboard stats  |



-----

###  🚀 Future Improvements

🤖 AI-based problem recommendation
📈 Advanced analytics
☁️ Cloud deployment
🔔 Smart notifications

--- 

### 👨‍💻 Author

Piyush Mishra

LinkedIn: https://www.linkedin.com/in/mishra162005
GitHub: https://github.com/Piyush200516

---

### ⭐ Support

If you like this project, give it a ⭐ on GitHub!