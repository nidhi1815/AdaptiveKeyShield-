# Run instructions (macOS + Windows)

This project has two parts:
- **Backend**: Python (Flask) + ML IDS + crypto demo (ECDH + AES)
- **Frontend**: React (Vite) + Tailwind UI

---

## Prerequisites (everyone)

- **Git**
- **Python 3.11+** (3.12 works)
- **Node.js 20.19+** (or 22.12+) + npm
  - If you are on Node **20.18** you may see a Vite warning; upgrade for best results.

---

## 1) Clone the repo

```bash
git clone https://github.com/nidhi1815/AdaptiveKeyShield-.git

cd AdaptiveKeyShield-
```

---

## 2) Backend setup (Python)

### macOS / Linux

Create and activate a virtual environment:

```bash
python3 -m venv backend/.venv
source backend/.venv/bin/activate
python -m pip install --upgrade pip
pip install -r backend/requirements.txt
```

**Important (macOS only): XGBoost needs OpenMP**

```bash
brew install libomp
```

Train and save the fitted ML pipeline (creates `backend/model/ids_pipeline.joblib`):

```bash
python backend/train_ids_pipeline.py
```

Run the backend (default port 5000):

```bash
python backend/app.py
```

If port 5000 is already in use:

```bash
PORT=5001 python backend/app.py
```

### Windows (PowerShell)

Create and activate a virtual environment:

```powershell
py -m venv backend\.venv
backend\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r backend\requirements.txt
```

Train and save the fitted ML pipeline:

```powershell
python backend\train_ids_pipeline.py
```

Run the backend:

```powershell
python backend\app.py
```

If port 5000 is already in use:

```powershell
$env:PORT=5001
python backend\app.py
```

---

## 3) Frontend setup (React)

From the repo root:

```bash
cd frontend
npm install
npm run dev
```

Vite will print a URL like:
- `http://127.0.0.1:5173/` (or the next available port)

### If your backend is NOT on port 5000

Start the frontend with:

```bash
VITE_API_BASE_URL=http://127.0.0.1:5001 npm run dev
```

Windows (PowerShell):

```powershell
$env:VITE_API_BASE_URL="http://127.0.0.1:5001"
npm run dev
```

---

## 4) Test the demo

1. Open the frontend URL in your browser
2. Enter any **User ID** + **Message**
3. Click **Send Message**
4. Check:
   - Browser console logs (encryption + IDS flow)
   - Backend terminal logs (decrypt + IDS + key rotation)

---