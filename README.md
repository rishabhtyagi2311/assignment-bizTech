This is a high-level, detailed version of your `README.md`. It highlights the specific technical engineering you've done—like the **State Machine logic**, the **Heartbeat Monitor**, and the **custom JSON injection**—to ensure the examiners see the depth of your work.

---

# AI-Powered Industrial Monitoring System

An end-to-end Computer Vision analytics pipeline designed for real-time manufacturing oversight. This system transforms raw AI detections from edge cameras into high-level business intelligence, tracking operator efficiency and workstation health with surgical precision.

## 🏗 Architecture & Data Flow
The system is built on a high-availability **Edge-to-Cloud** pattern, ensuring that data is not just collected, but intelligently processed.

1.  **Edge Simulation:** High-frequency JSON payloads representing human-action detections (e.g., `WORKING`, `IDLE`) and production telemetry (`PRODUCT_COUNT`).
2.  **Processing Logic (The "Brain"):** A custom-built state machine in **Node.js** that converts "Point-in-time" events into "Duration-based" sessions.
3.  **Persistence Layer:** **PostgreSQL** via **Prisma ORM**, utilizing transactions to ensure that session transitions (e.g., stopping work to start a break) are atomic and consistent.
4.  **Frontend Analytics:** A **React 18** dashboard using **Tailwind CSS** and **Lucide-React** for a premium, B2B-grade user experience.

---

## 💾 Detailed Database Schema
We utilized a normalized relational schema to maintain a strict "Chain of Custody" for every production event.

* **`AIEvent` (Raw Logs):** The immutable source of truth. Every signal from the camera is stored here with its original timestamp and confidence score.
* **`WorkstationSession` (The State Machine):** Where the real work happens. This table tracks continuous intervals. For example, if a worker is at a station for 2 hours, this table calculates exactly how much of that was `WORKING` vs. `IDLE`.
* **`WorkstationDailyStats` (The Aggregation Layer):** To ensure the dashboard remains lightning-fast, we pre-calculate daily totals (Total Units, Total Occupancy, Total Downtime) so the UI doesn't have to scan millions of rows on every refresh.

---

## 📊 Metric Calculation Logic
Our metrics are designed to be "Audit-Ready," calculated with a precision of 0.01.

| Metric | Technical Implementation | Purpose |
| :--- | :--- | :--- |
| **Occupancy** | $\sum (WorkingDuration + IdleDuration)$ | Tracks the total "Man-Hours" invested in a station. |
| **Utilization %** | $\frac{TotalWorkingTime}{TotalOccupancyTime} \times 100$ | Measures operational efficiency (eliminating waste). |
| **Throughput** | $\frac{TotalProductCount}{TotalOccupancyHours}$ | Standardized production rate for cross-site benchmarking. |
| **Downtime** | $\sum MalfunctionDuration$ | Quantifies technical debt and hardware reliability. |

---

## 🛠 Advanced Resilience & Engineering
We addressed three critical real-world "Edge Computing" challenges:

### 1. The "Zombie Session" Heartbeat Monitor
**Problem:** What happens if a camera loses power? It can't send an "OFF" signal.
**Solution:** We built a **Cron-based Heartbeat Monitor**. Every 5 minutes, the backend scans for active sessions that haven't sent a signal in **15 minutes**. If found, the system retroactively "kills" the session at the last known activity time and opens a **Downtime/Malfunction** bridge.

### 2. State-Aware Event Deduplication
To prevent database bloat, our ingestion logic is state-aware. If the edge device spams multiple "WORKING" events, our backend recognizes the workstation is already in a `WORKING` session and ignores the redundant updates, only acting when a **state change** (e.g., to `IDLE`) occurs.

### 3. Chronological Consistency (Timestamp Sorting)
In distributed systems, Event B can arrive before Event A. Our system implements a **Temporal Sorting Layer** that re-orders incoming payloads based on their original edge-generation timestamp before they enter the state machine logic.

---

## 🚀 Theoretical Scaling & MLOps

### Model Drift & Versioning
* **Versioning:** Each `AIEvent` is tagged with a `model_version` (e.g., `v1.4.2`). This allows us to run **Shadow Mode** deployments where two models run side-by-side to compare accuracy.
* **Drift Detection:** We monitor the **Confidence Delta**. If the average confidence score for `PRODUCT_COUNT` drops significantly over 24 hours, the system triggers a "Scene Change" alert, indicating the model may need retraining for new environment variables (lighting, camera angles).

### Scaling to 1000+ Cameras
To handle high-scale ingestion, we would transition from a synchronous REST API to an **Event-Driven Architecture**:
1.  **Ingestion:** Cameras push events to **Apache Kafka** or **Redis Streams**.
2.  **Processing:** Independent **Worker Microservices** consume the stream and update the state machine.
3.  **Storage:** Cold storage of raw events in a **Data Lake** (S3), while keeping the active `DailyStats` in a high-speed **PostgreSQL** instance.

---

## 📝 Assumptions and Tradeoffs
* **Atomic Consistency over Eventual Consistency:** We chose PostgreSQL to ensure that session data is always 100% accurate. In a factory setting, "rough estimates" are not acceptable for payroll or output auditing.
* **Worker-Station Coupling:** We assume a 1:1 ratio between an active worker and a workstation at any given moment. Multi-worker station support would be a future architectural iteration.
