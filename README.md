# ScamShield Nepal — AI Payment Safety & Scam Detection

A production-quality FinTech web application designed for Nepali online sellers, small merchants, and digital payment users. Inspired by modern financial dashboards (Stripe, Linear, Wise), ScamShield Nepal helps users detect warning signs in suspicious payment screenshots, fraudulent messages, and phishing URLs before dispatching goods.

![ScamShield Nepal](https://img.shields.io/badge/Status-Hackathon%20Ready-2563EB)
![React](https://img.shields.io/badge/React-19-blue)
![Vite](https://img.shields.io/badge/Vite-5.4-purple)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-teal)

---

## 🌟 Key Features

### 1. 🛡️ Realistic Risk Analysis Engine (`/analyze` & `/results`)
- **Three Input Modalities**:
  - **Payment Screenshot**: Drag-and-drop dropzone, file validation, live preview card with eSewa/Khalti vouchers, image replacement, and removal.
  - **Suspicious Message**: Text input with live character counter, preloaded merchant fraud templates (urgent courier rush, overpayment scam claim, Nepali rush message).
  - **Suspicious URL**: Safe sandboxed URL inspection with validation and explanations.
- **Realistic Progressive Stepper**:
  - Step 1: Extracting text (OCR / Tokenization)
  - Step 2: Checking warning signs (Heuristic risk patterns)
  - Step 3: Preparing findings
- **Structured Findings Panel**:
  - Severity indicators: High Concern (`#DC2626`), Needs Verification (`#D97706`), No Major Warnings (`#15803D`).
  - Evidence extracted directly from submissions.
  - Actionable guidance tailored to Nepal's payment landscape (eSewa, Khalti, ConnectIPS, Fonepay).
- **Merchant Verification Checklist**:
  - 5-step SOP to prevent goods dispatch without bank statement clearance.
  - One-click **Copy Findings** to clipboard.
  - One-click **Download Report** (downloads `.txt` audit report).

### 2. 📊 Merchant Dashboard (`/overview`)
- Illustrative demo metrics: Total Scans (128), Flagged Cases (23), Requiring Review (8), Recent Activity (12).
- Himalayan & Phone security illustrated banner celebrating Nepal's fintech identity.
- Quick Scan card with direct file upload and mode switches.
- Recent activity feed with interactive detail view.
- Proactive merchant safety tip card.

### 3. 📜 Filterable Scan History (`/history`)
- Real-time search across items, dates, and risk categories.
- Filter pills: All Scans, High Concern, Needs Verification, No Major Warnings.
- Interactive table with status badges and pagination controls (`< 1 2 3 >`).
- Direct action menu: View full original findings, or delete scan records.

### 4. 📚 Nepal Payment Safety Guide (`/guide`)
- 6 interactive educational guides with actionable checklists and practical examples:
  1. Fake Payment Screenshots
  2. QR Code Substitution (Physical retail tamper risk)
  3. Phishing & Impersonation (MPIN & OTP scam calls)
  4. Suspicious Wallet Messages (Personal SIM SMS vs official 38000 shortcodes)
  5. Fake Online Store Requests (Overpayment scam & courier pressure)
  6. Safe Payment Verification Standard (Native app statement inspection)

### 5. 🌐 Full English & Nepali (नेपाली) Bilingual Support
- Instant bilingual toggle (`EN / नेपाली`) available in the top bar and settings.
- Natural Nepali phrasing reflecting authentic merchant and banking terminology.

### 6. ⚙️ Settings & Microservice Integration
- Language selection with local persistence.
- Notifications toggle.
- Privacy & data retention configuration (30, 60, 90 days, or Never store).
- History wipe with confirmation modal.
- Configurable **FastAPI Backend Endpoint** for seamless future model integration.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ or v20+)
- npm

### Installation & Run

```bash
# Navigate to project directory
cd ScamShield

# Install dependencies (if not already installed)
npm install

# Start development server
npm run dev
```

Open `http://localhost:5173` in your browser.

### Building for Production

```bash
npm run build
```

---

## 🏗️ Architecture & Extensibility

The codebase separates analysis logic from UI components:
- `src/utils/analysisEngine.js`: Heuristic rules and risk evaluation engine. Can be replaced with an `async fetch()` call to a Python/FastAPI microservice without changing any UI code.
- `src/context/AppContext.jsx`: Central state management for history, active scans, language, and notifications.
- `src/data/`: Centralized translations, initial demo records, and safety guides.
- `src/components/`: Modular, clean presentation components organized by feature domain.

---

## ⚖️ FinTech Disclaimer
ScamShield identifies potential warning signs. This analysis cannot independently confirm whether money was received or prove that a person or transaction is fraudulent. Merchants must always verify deposits in their authentic mobile banking or wallet application ledger before releasing goods or services.
