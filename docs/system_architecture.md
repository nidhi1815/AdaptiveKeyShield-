## System Architecture of Adaptive Cryptographic Key Management using Machine Learning-based Intrusion Detection

The proposed system integrates a machine learning–based intrusion detection model with a dynamic cryptographic key management mechanism. 

It ensures secure communication by continuously monitoring network behavior and automatically rotating encryption keys when an attack is detected.

```mermaid
flowchart LR
    A[Data Input] --> B[Intrusion Detection System]
    B --> C[Key Management System]
    C --> D[Secure Communication]
```

### Folder Structure

```bash
AdaptiveKeyShield/
│
|__ docs/
├── backend/                                 # Python + Flask backend (security & ML logic)
│   ├── app.py                               # Main Flask API server (handles login, IDS, key mgmt)
│   ├── model/
│   │   └── ids_model.pkl                    # trained ML model for Intrusion Detection System
│   ├── crypto/
│   │   ├── encrypt.py                       # Handles encryption/decryption (AES/RSA)
│   │   └── key_rotation.py                  # Key rotation logic when anomaly is detected
│   ├── requirements.txt                     # backend dependencies (Flask, cryptography, sklearn, etc.)
│   └── README.md                            # Backend setup instructions
│
└── frontend/                                # React + Tailwind frontend (user interface)
    ├── node_modules/                        # Installed npm dependencies (auto-generated)
    ├── public/                              # Public static assets (favicons, manifest, etc.)
    ├── src/                                 # Main React source code
    │   ├── components/                      # Reusable UI building blocks
    │   │   ├── LoginForm.jsx                # White login card — user enters ID & password
    │   │   └── BackgroundPanel.jsx          # Transparent right panel — shows AI-powered features
    │   ├── pages/                           # Page-level components (like dashboard, reports)
    │   │   └── Dashboard.jsx                # Example dashboard for post-login view
    │   ├── App.jsx                          # Combines login + background, sets global layout
    │   ├── main.jsx                         # React entry file (renders <App /> to the DOM)
    │   └── index.css                        # Tailwind base, components, utilities import
    │
    ├── index.html                           # Entry HTML file loaded by Vite
    ├── package.json                         # Project dependencies + scripts (npm run dev/build)
    ├── vite.config.js                       # Vite configuration (dev server, aliases, etc.)
    ├── tailwind.config.js                   # Tailwind setup (content paths, theme, plugins)
    ├── postcss.config.js                    # Enables Tailwind + autoprefixer for CSS
    ├── package-lock.json                    # Dependency versions lockfile
    └── README.md                            # Frontend setup guide (commands, tech stack, credits)

```
