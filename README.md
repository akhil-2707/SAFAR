# S.A.F.A.R. — Smart AI Framework for Assured & Responsible Tourism

**Project:** S.A.F.A.R. (SIH 2026)  
**Title:** Smart Tourist Safety Monitoring & Incident Response System using AI, Geo-Fencing, Ghost-Mesh, and Blockchain-based Digital ID  
**Ministry:** Ministry of Tourism, Government of India  
**Theme:** Travel & Tourism / Student Innovation  
**Category:** Software  

---

## 🌟 Solution Overview

**SafeTour NE** is a centralized, government-grade smart tourist safety platform tailored specifically for the North Eastern Region of India. It integrates **cryptographic SHA-256 Digital Tourist IDs**, **explainable AI risk scoring**, **map-based geo-fencing**, and an **automated incident response workflow** into a unified, real-time command platform.

---

## Key Features

1. **Digital Tourist ID & QR Code**: Generates holographic digital credentials with SHA-256 cryptographic signature, travel validity dates, emergency contacts, and public verification endpoints.
2. **Prototype Blockchain Ledger**: A tamper-evident ledger architecture storing non-sensitive verification hashes. Features 1-click **Integrity Auditing** and interactive **Tampering Simulation** for SIH judges.
3. **Map-Based Dynamic Geo-Fencing**: Point-in-polygon containment engine mapping Safe (Green 🟢), Caution (Yellow 🟡), Restricted (Red 🔴), and High-Risk (Dark Red 🛑) zones in North-East terrain.
4. **Explainable AI Safety Engine**: Transparent multi-factor risk score calculation (0–100) evaluating zone hazard weight, time of day, inactivity duration, route deviation offset, and active SOS triggers with natural language diagnostics.
5. **1-Click Emergency SOS Dispatch**: Prominent red SOS button with 3-second confirmation, GPS lock, response timer, nearby emergency services mapping, and cancel option.
6. **Central Authority Command Desk**: Live risk-colored tourist tracking map, real-time alert notifications, incident status transitions (New → Acknowledged → Assigned → In Progress → Resolved), and team dispatching console.
7. **Authority Analytics**: Recharts graphs showing incident trends, severities, category breakdowns, risk distributions, and average emergency response times.
8. **SIH Evaluator Demo Control Panel**: Floating toolbar permitting 1-click automated execution of all 6 judge test scenarios.

---

## 🛠️ Technology Stack

- **Frontend:** React 18, Vite, Tailwind CSS, Leaflet + React-Leaflet, Recharts, QRCode.react, Lucide React.
- **Backend:** Node.js, Express.js, JWT Authentication, Bcryptjs password hashing, Native Crypto SHA-256.
- **Data Persistence:** Dual-mode architecture (Connects to MongoDB `mongodb://127.0.0.1:27017/safetour_ne` if present, with automatic zero-setup fallback to an internal JSON state store populated with pre-seeded demo data).

---

## 📁 Project Structure

```
sih_project/
├── backend/
│   ├── config/              # Database connection & seed state store (db.js)
│   ├── controllers/         # API Controllers (auth, tourist, digitalId, incident, geofence, blockchain, trip, analytics, demo, notification)
│   ├── middleware/          # JWT & Role authorization middleware
│   ├── routes/              # Express API Routes
│   ├── services/            # Core AI Risk Engine, Blockchain Ledger, Incident Classifier
│   ├── utils/               # Polygon Ray-casting, Haversine Math, Seed Dataset
│   ├── .env.example         # Environment configuration template
│   ├── package.json
│   └── server.js            # Main Express server entry point
│
├── frontend/
│   ├── public/              # Static assets
│   ├── src/
│   │   ├── components/      # Navbar, Sidebar, MapView, DigitalIdCard, ExplainableAIPanel, SOSButtonModal, IncidentTimeline, DemoControlPanel
│   │   ├── pages/           # LandingPage, TouristDashboard, TouristRegister, LoginPage, VerifyDigitalIdPage, AuthorityDashboard, IncidentManagementPage, BlockchainLedgerPage, AnalyticsPage, TripPlannerPage
│   │   ├── App.jsx          # Router & Global Application State
│   │   ├── index.css        # Tailwind & Glassmorphism styles
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 🚀 Installation & Running Instructions

### 1. Backend Server Setup
```bash
cd backend
npm install
npm start
```
*Backend runs on `http://localhost:5000` (Health Check: `http://localhost:5000/api/health`)*

### 2. Frontend Application Setup
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs on `http://localhost:3000`*

---

## 🔑 Pre-Seeded Demo Credentials

| Role | Email | Password | Details |
| :--- | :--- | :--- | :--- |
| **Tourist (Rohan Verma)** | `rohan.verma@example.com` | `tourist123` | Tourist ID: `TID-1024` |
| **Authority (National Safety Desk)** | `authority@safetour.gov.in` | `admin123` | Central Safety Desk Officer |
| **Tourist Police HQ** | `police@safetour.gov.in` | `admin123` | Assam Tourist Police Patrol |
| **Disaster Response** | `disaster@safetour.gov.in` | `admin123` | Emergency Rescue Force |

---

## 🎯 5–7 Minute SIH Evaluator Demonstration Flow

Use the floating **SIH Evaluator Demo Control Panel** at the bottom-right corner of the application to execute the scenarios in real-time:

1. **Scenario 1 — Normal Safe Tourist:** Click `1. Normal Safe Tourist`. Tourist moves to Guwahati Safe Hub. Risk score = 15 (LOW 🟢). Map marker turns green.
2. **Scenario 2 — Geo-fence Breach:** Click `2. Geo-fence Violation`. Tourist enters Kamrup Restricted Border Buffer (Red Zone). Risk score jumps to 75 (HIGH 🟠). Incident logged & authority notified.
3. **Scenario 3 — Route Deviation Anomaly:** Click `3. Route Deviation`. Tourist moves 3.8 km off-route. AI Anomaly Engine flags route deviation (+20 pts risk).
4. **Scenario 4 — 1-Click SOS Emergency:** Click `4. Trigger SOS Emergency`. Emergency SOS dispatches with CRITICAL 🔴 severity, 100 risk score, active dispatch timer, and nearby police/hospital mapping.
5. **Scenario 5 — Blockchain Ledger Verification:** Click `5. Verify Blockchain`. Opens Blockchain Audit page. SHA-256 integrity check passes: `✓ Prototype Blockchain Ledger Integrity Verified`.
6. **Scenario 6 — Blockchain Tampering Simulation:** Click `6. Simulate Tampering`. Modifies Block #1 data. Integrity audit instantly flags: `✗ Tampering Detected! Current block #1 hash mismatch.` Click `Restore Ledger` to repair chain.

---

## 🔐 Security & Privacy Architecture

- **Zero Raw Document Exposure:** No raw sensitive identity documents are stored directly on the blockchain. Hashing algorithms ensure privacy compliance.
- **JWT & Password Security:** Passwords are hashed using `bcryptjs` with salt rounds. Protected routes verify JWT tokens.
- **Explainable AI:** Risk scores are calculated transparently with clear natural language reasons rather than unexplainable black-box metrics.

---

## 📄 License & Credits

Developed for the **Smart India Hackathon (SIH 2026)** — **S.A.F.A.R.** (Ministry of Tourism, Government of India).
