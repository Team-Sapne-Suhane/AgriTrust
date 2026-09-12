# 🌾 AgriTrust: National Parametric Drought Micro-Insurance Platform
> **Empowering Indian Smallholder Farmers with Instant, Zero-Friction, Multi-Oracle Drought Insurance Payouts**

[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-8.0-purple.svg)](https://vitejs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## 📌 Executive Summary

Traditional crop insurance schemes (such as PMFBY) suffer from **delayed manual loss assessments (3–6 months)**, high administrative overhead, and complex paperwork that alienates rural smallholders. 

**AgriTrust** is an end-to-end, production-grade **Parametric Micro-Insurance Engine** designed specifically for Indian agriculture. By continuously evaluating real-time environmental triggers across a quorum of independent oracles, AgriTrust initiates **instant, automated Direct Benefit Transfer (DBT) payouts** directly to farmers' bank accounts the moment drought conditions are mathematically proven—**requiring zero claims filing by the farmer**.

---

## 🏛️ System Architecture

AgriTrust is structured as a clean **3-Tier Modular Architecture**:

`
fintech_project/
├── src/
│   ├── frontend/         # React 18 + Vite + Tailwind Responsive UI
│   │   ├── components/   # Modular UI: Farmer Portal, Policy Studio, Oracle Station, DB Inspector
│   │   ├── translations/ # Vernacular localization (Telugu, Hindi, English)
│   │   └── index.css     # Clean Government portal styling (Tiranga theme)
│   ├── backend/          # Core Business Logic & Algorithmic Engines
│   │   └── services/     # Multi-Oracle Quorum, Declarative Policy Engine, Wire Budget, Voice Engine
│   ├── database/         # Offline-First Storage Engine
│   │   ├── schemas/      # TypeScript schemas for Policies, Oracles, Audits, Outbox
│   │   ├── seeds/        # Verified AgriStack farmer profiles & regional mock data
│   │   └── services/     # IndexedDB + LocalStorage reactive ledger
│   └── types/            # Shared type definitions across all tiers
`

---

## 🚀 Key Technical Innovations & Highlights

### 1. 🛰️ Multi-Oracle Byzantine Consensus Engine
To eliminate single-point-of-failure vulnerabilities and oracle manipulation, AgriTrust ingests telemetry from 4 diverse data sources:
- **IMD (India Meteorological Department)**: Ground Automated Weather Stations (AWS).
- **ISRO MOSDAC / Bhuvan**: Satellite Soil Moisture & Optical NDVI Biomass health.
- **Global Reanalysis (Open-Meteo)**: Satellite-derived rainfall & temperature models.
- **Hyperlocal IoT Soil Probes**: LoRaWAN field sensors.

#### Handled Failure Modes:
- **Disagreement / Divergence**: Flags variance exceeding threshold ($\sigma > 25\%$) and weights trusted ground stations.
- **Stale Oracles**: Rejects timestamps older than 6 hours.
- **Corrupted Outliers**: Winsorizes sensor spikes before consensus aggregation.
- **Quorum Threshold**: Requires minimum $-of-$ (e.g. $\ge 3/4$) valid signals to execute automatic payout triggers.

---

### 2. ⚡ Declarative DSL Policy Engine
Insurance contracts are written as declarative, JSON-serializable rules rather than hardcoded logic.
- **Configurable Triggers**:
  - Consecutive dry days without rain ($\ge 21\text{ days}$).
  - Critical root-zone soil moisture drop ($< 15\%$).
  - NDVI vegetative health index deficit ($< 0.32$).
- **Dynamic Payout Curves**:
  - **Cliff Trigger**: \%$ sum insured payout upon crossing catastrophic thresholds.
  - **Tiered / Linear Curve**: Pro-rata payout proportional to deficit severity.

---

### 3. 📦 108-Byte Ultra-Low Bandwidth GSM Wire Budget
For deep rural areas lacking 4G/5G data connectivity, AgriTrust includes a compact binary bit-packer that serializes policy status, oracle readings, and payout signatures into a **single 108-byte payload** (well below the 140-byte GSM SMS limit):
`
[Header: 1B] [PolicyID: 4B] [Timestamp: 4B] [Metric Flags: 2B] [Consensus Hash: 32B] [Compact Sig: 65B] = 108 Bytes
`

---

### 4. 📴 Offline-First IndexedDB Local Ledger
- Fully operational without internet connectivity via a client-side reactive IndexedDB ledger.
- Mutations queue automatically in an **Offline Outbox**.
- **Cryptographic Audit Trail**: Every policy creation, oracle state update, and DBT payout generates a deterministic **SHA-256 state hash** for transparent government auditing.

---

### 5. 🗣️ Vernacular Voice AI & Low-Literacy Comprehension Check
- Native tri-lingual interface supporting **Telugu (తెలుగు)**, **Hindi (हिन्दी)**, and **English**.
- **Web Speech API & Voice Feedback**: Read-aloud narration of policy terms, coverage details, and payout notifications.
- **Interactive Audio Comprehension Check**: Protects vulnerable farmers by verifying their understanding of terms before policy activation.

---

### 6. 📱 USSD (*999*7#) & IVR Phone Call Simulator
- Built-in interactive simulator for basic feature-phone users.
- Live automated voice call modal demonstrating how illiterate farmers receive spoken payout alerts and bank transfer confirmations.

---

## 🛠️ Tech Stack & Libraries

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 18 + TypeScript |
| **Bundler & Tooling** | Vite 8 + PostCSS |
| **Styling & Design System** | Tailwind CSS + Lucide Icons + National Gov Portal Palette |
| **Audio & Speech** | Web Speech API (SpeechSynthesis) + Web Audio API oscillators |
| **Storage & Persistence** | IndexedDB (localDb) + LocalStorage fallback |
| **Cryptography** | Web Crypto API (SHA-256, deterministic hash chains) |

---

## 💻 Local Development Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **yarn** / **pnpm**

### Installation
`ash
# 1. Clone repository
git clone https://github.com/Team-Sapne-Suhane/AgriTrust.git
cd AgriTrust

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
`

Open http://localhost:5173 in your browser.

### Production Build
`ash
npm run build
npm run preview
`

---

## 👥 Hackathon Team: Team Sapne Suhane
- **Domain**: agrii-trust.netlify.app
- **Platform**: AgriTrust (National Parametric Drought Micro-Insurance)

---

## 📄 License
This project is licensed under the MIT License.
