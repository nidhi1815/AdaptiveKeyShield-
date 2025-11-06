# 🛡️ AdaptiveKeyShield  

### *Adaptive Cryptographic Key Management using Machine Learning-based Intrusion Detection*  

[![Security](https://img.shields.io/badge/Security-Focused-blue)]()
[![Machine Learning](https://img.shields.io/badge/Machine%20Learning-Enabled-green)]()
[![Status](https://img.shields.io/badge/Stage-Research%20Project-lightblue)]()

## Overview

**AdaptiveKeyShield** is a security-focused framework that enhances communication privacy by combining **Machine Learning-based Intrusion Detection Systems (IDS)** with **Dynamic Cryptographic Key Management**.  

Traditional systems rely on **static encryption keys**, which can be stolen or brute-forced.  
Our adaptive model automatically **rotates encryption keys** whenever an intrusion is detected — providing real-time protection and minimizing attack windows.

---

## ⚙️ System Architecture

### 1. Frontend

- Secure login interface where users enter credentials.
- Passwords are **encrypted client-side** before transmission.
- Provides alerts when IDS triggers a key rotation event.

### 2. Backend

- Implements **AES encryption** for secure data handling.
- Performs **Diffie-Hellman (DH)** or **Elliptic Curve Diffie-Hellman (ECDH)** key exchange.
- Integrates the **Machine Learning-based IDS** for real-time anomaly detection.
- Automatically updates encryption keys when intrusions are detected.

### 3. Intrusion Detection System (IDS)'

- Uses supervised ML algorithms to detect abnormal network or login patterns.
- Trained on benchmark cybersecurity datasets:
  - UNSW-NB15
  - NSL-KDD
  - KDD Cup 99
- Detects malicious activity → triggers key regeneration event.


## Dynamic Key Rotation Process

| Step | Description |
|------|--------------|
| 1️⃣ | User submits encrypted credentials |
| 2️⃣ | IDS monitors traffic and detects anomalies |
| 3️⃣ | On intrusion detection → key rotation initiated |
| 4️⃣ | New session key generated via **ECDH** |
| 5️⃣ | Encryption module seamlessly updates to new key |

**Advantages:**

- Minimizes attack surface  
- No downtime during key update  
- Protects against brute-force, replay, and man-in-the-middle attacks  

---

## 📊 Dataset Details

**Dataset Used:**  
🔗 [Cybersecurity Intrusion Detection Dataset (Kaggle)](https://www.kaggle.com/datasets/dnkumars/cybersecurity-intrusion-detection-dataset)

| Feature | Description |
|----------|--------------|
| `network_packet_size` | Packet size in bytes |
| `protocol_type` | Network protocol used |
| `encryption_used` | Encryption protocol type |
| `failed_logins` | Number of failed logins |
| `session_duration` | Session length (seconds) |
| `ip_reputation_score` | Source IP trust score |
| `attack_detected` | Binary label (0 = Normal, 1 = Intrusion) |

---

## 🧮 Evaluation Metrics

- **Detection Accuracy**
- **False Positive Rate**
- ⚡ **Latency Impact**
- 📈 **Throughput Change** (after key rotation)

---

## Expected Outcomes

- Stronger network security  
- Reduced attack exposure window  
- Fast, adaptive intrusion response  
- Low computational overhead (enterprise-friendly)

---

## 🧰 Tech Stack

| Layer | Tools / Frameworks |
|--------|--------------------|
| **Frontend** | HTML, CSS, JavaScript / React |
| **Backend** | Python (Flask / FastAPI) or Node.js |
| **Machine Learning** | Scikit-learn, TensorFlow / PyTorch |

---

## 🔍 References

- *Dynamic Key Cryptography and Applications*  
- *Secure Communication in Networks: A Comprehensive Survey of Lightweight Encryption and Key Management Techniques*  
- *Enhancing Security in WSNs using Autoencoder-Based IDS and ECC with Dynamic Key Rotation*  
- *Machine Learning-Based Network Anomaly Detection*  
- *Performance Evaluation of IDS using Apache Spark*  
- *Evaluating Classification Algorithms on the UNSW-NB15 Dataset for Network Intrusion Detection*

---

## Acknowledgments

This project is developed as part of our **Final Year Project**.  
We extend our gratitude to our mentors and reviewers for their continuous guidance.