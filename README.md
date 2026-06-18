# 🧑‍🏫 PeerLearn – Peer Tutoring Platform

**PeerLearn** is a full-stack web application that connects students and tutors through a seamless, secure, and modern platform.  
It allows students to discover tutors, book sessions, and leave reviews, while tutors can manage profiles and track performance.  
Admins have centralized control over tutor approvals and user management.

<img width="1463" height="826" alt="image" src="https://github.com/user-attachments/assets/70384070-e07d-4c51-b69b-1e037ea4bc1e" />

---
## Key Features
#### 🔐 Role-Based Authentication – Secure login for Students, Tutors, and Admins
####🧠 Tutor Discovery – Search and filter tutors by subject, rating, language, and experience
#### 🗓️ Session Booking – Seamless scheduling between students and tutors
#### 👑 Admin Dashboard – Approve tutors, manage users, and send notifications
#### 📊 Performance Tracking – Real-time rating and review updates
---
## 🛠️ Tech Stack

### Frontend
- React.js
- TypeScript
- Tailwind CSS

### Backend
- Node.js
- Express.js

### Database
- PostgreSQL
- Supabase

### Authentication
- Supabase Auth
- Role-Based Access Control (RBAC)

---
## System Architecture

<img width="521" height="504" alt="image" src="https://github.com/user-attachments/assets/3d69fe32-42f6-43b0-82f0-efef946adcc2" />

---
## ⚙️ Installation & Setup

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/hiflyer246/PEERLearn.git
cd peerlearn
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
RESEND_API_KEY=your_resend_api_key
```

### 4️⃣ Start Development Server

```bash
npm run dev
```

### 5️⃣ Build for Production

```bash
npm run build
```

