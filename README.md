# 🗨️ Real-Time Chat App with Admin Panel

A full-stack MERN (MongoDB, Express, React, Node.js) based real-time chat application that supports one-to-one messaging, live online user status, and includes an admin dashboard to manage users efficiently.

---

## 🚀 Features

### 💬 Chat System
- Real-time **1:1 private chat**
- Live message delivery using **Socket.IO**
- Message history persistence

### 🟢 Online Status
- Displays users’ **online/offline** status in real-time
- Automatically updates on login/logout or disconnect

### 👤 User Profile
- View & update user profile info
- Display name, avatar, email, etc.

### 🔐 Admin Panel
- **Only accessible to admin users**
- **CRUD operations** on users: Add, Edit, Delete
- Role-based protection using protected routes

---

## 🛠️ Tech Stack

| Frontend            | Backend           | Database   | Realtime  |
|---------------------|-------------------|------------|-----------|
| React (Vite)        | Node.js + Express | MongoDB    | Socket.IO |

---

## ⚙️ Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/chatty.git
cd chatty
````

### 2. Backend Setup

```bash
cd backend
npm install
# Set environment variables in .env file
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. Environment Variables

Create `.env` in `/backend`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/chatapp
JWT_SECRET=your_secret_key
```

---

## 🔐 Admin Access

* Admin routes are protected.
* Only users with role `admin` can access the Admin Panel.
* If you don’t have an admin account, manually update a user’s role in MongoDB.

---

## 📂 Project Structure

```
├── backend
│   ├── controllers
│   ├── models
│   ├── routes
│   └── utils
├── frontend
│   ├── components
│   ├── pages
│   ├── store
│   └── hooks
```

---

## 📸 Screenshots (Add later)

* Chat Page
* Online User Indicator
* Admin Panel (User Management)
* Profile Page

---

## 🧑‍💻 Author

Built by [Dipanshu Zalke](https://dipanshuzalke.xyz)

