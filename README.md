# 🎙️ ASR-RAG Platform: Intelligent Lecture Processing System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D%2016.x-brightgreen.svg)](https://nodejs.org/)
[![React Version](https://img.shields.io/badge/react-%3E%3D%2018.x-blue.svg)](https://reactjs.org/)

An end-to-end platform for converting educational multimedia content into searchable, interactive knowledge bases. This repository contains the **Orchestration Backend** and the **Modern UI Frontend**.

---

## ✨ Key Features

- **🚀 Real-time Processing:** Streamlined pipeline from audio upload to transcription.
- **🧠 Semantic RAG:** Integrated Retrieval-Augmented Generation for intelligent Q&A based on lecture content.
- **✍️ GEC Integration:** Automatic Grammar Error Correction for high-quality transcripts.
- **📊 Content Summarization:** Automated extraction of key points and executive summaries.
- **📱 Responsive Design:** Premium, dark-themed UI optimized for all devices.

---

## 🏗️ System Architecture

The system operates as a distributed microservices architecture:

1.  **Frontend (React):** A high-performance SPA providing an intuitive interface for file management, transcription visualization, and AI chat.
2.  **Backend (Node.js/Express):** The central hub managing authentication, file storage (Cloudinary/Local), database persistence (MongoDB), and job orchestration.
3.  **ML Engine (FastAPI - *External*):** A specialized Python server hosting large-scale models (Whisper, ViT5) for heavy-lifting AI tasks.

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 18+ with Vite
- **State Management:** Context API / Hooks
- **Styling:** Vanilla CSS (Modern CSS3)
- **Icons:** Lucide-React
- **Networking:** Axios

### Backend
- **Runtime:** Node.js
- **Framework:** Express
- **Database:** MongoDB (via Mongoose)
- **Authentication:** JWT (JSON Web Tokens)
- **File Handling:** Multer & Cloudinary SDK

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (Running locally or on Atlas)
- Git

### 1️⃣ Backend Setup
Navigate to the backend directory and configure the environment:

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/asr_rag_db
JWT_SECRET=your_super_secret_key
ML_SERVER_URL=http://localhost:8000
CLOUDINARY_CLOUD_NAME=your_name
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
```

Start the development server:
```bash
npm run dev
```

### 2️⃣ Frontend Setup
Navigate to the frontend directory:

```bash
cd frontend
npm install
```

Start the Vite development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or `3000` depending on configuration).

---

## 📁 Repository Structure

```text
.
├── backend/            # Express server, controllers, services, models
├── frontend/           # React application, components, hooks, assets
└── README.md           # This file
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request or open an issue for any bugs or feature requests.

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Developed for NCKH 2025-2026*
