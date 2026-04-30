<!--
  CodeDNA
  README.md — core functionality
  exports: none
  used_by: internal
  rules: Follow project conventions
  agent: gemini-3-1-pro | google | 2026-04-30 | init | Initialized CodeDNA semi mode
-->

# MindBook | Premier Social Space 🌟

MindBook is a high-fidelity, fully responsive social media platform. Designed with a vibrant Yellow/Gold aesthetic, it offers a familiar Facebook-like experience but with a unique visual identity and optimized for performance.

Built on the **MERN stack**, MindBook provides a robust set of features for community building, content sharing, and real-time interaction.

## ✨ Core Features

- **24-Hour Stories:** Disappearing photo/video stories with full-screen viewer, auto-advancement, and management.
- **Infinite News Feed:** True infinite scrolling using `react-intersection-observer` for seamless content consumption.
- **Multi-Media Posts:** Create posts with text, high-quality image/video uploads, and location tagging.
- **Global Search:** Consolidated search across users, posts, and groups with real-time suggestions.
- **URL Auto-Linking:** Automatically detects and converts URLs in posts into clickable links.
- **Engagement System:** Real-time feel notifications for likes, comments, and friend activities.
- **Friend Ecosystem:** Full friend request lifecycle (Send, Accept, Decline, Cancel) and mutual friend discovery.
- **Groups & Events:** Dedicated hubs for community interaction and event planning (accessible via Navbar).
- **Rich Profiles:** Personalized user profiles with cover photos, bios, work/education history, and post history.
- **Smart Sidebars:** Quick access to contacts, friend suggestions, and trending topics.
- **Mobile First:** Fully responsive design with optimized touch interactions and layouts.

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, TypeScript, Redux Toolkit, React Router 6.
- **Backend:** Node.js, Express, Mongoose (MongoDB), Multer (uploads).
- **Authentication:** JWT with secure token management and protected routes.
- **Design:** Custom CSS Variable-based design system for unified branding.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB (Local or Atlas)

### 1. Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` (Port, Mongo URI, JWT Secret)
4. `npm run dev` (Runs on port 5000)

### 2. Frontend Setup
1. `cd frontend`
2. `npm install`
3. `npm run dev` (Runs on port 5173)

---

## 🎨 Design Philosophy
MindBook uses a "Gold Standard" design system. The primary palette revolves around:
- **Brand Primary:** `#F7B928` (Vibrant Yellow)
- **Brand Secondary:** `#FFD700`
- **Surface:** Glassmorphism-inspired card layouts and subtle gradients.

---

## 📜 License
Developed as a premium social media demonstration. All rights reserved.
