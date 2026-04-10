

# AI-Powered Industrial Monitoring System

This project is a comprehensive monitoring solution designed to track worker productivity and workstation health in a manufacturing environment. It processes computer vision events from edge devices to provide real-time analytics on factory operations.

## 🏗 Architecture Overview

The system architecture is divided into three distinct layers:

1.  **Edge Layer (Data Source):** Simulated AI-enabled cameras detect worker states and production counts. These events are transmitted as JSON payloads containing metadata such as timestamps, confidence scores, and entity IDs.
2.  **Backend Layer (Processing Engine):** Built with **Node.js** and **Prisma**, this layer acts as a state machine. It consumes raw events and transforms them into time-based "Sessions" to calculate durations for working, idle, and downtime states.
3.  **Dashboard Layer (Visualization):** A **React** and **Tailwind CSS** interface that provides a multi-level view of operations. It allows managers to filter data by workstation, worker, or event type to identify bottlenecks in real-time.

## 💾 Database Schema

The database is structured to ensure high performance and data traceability:
* **Worker:** Metadata for factory personnel.
* **Workstation:** Metadata for physical assembly lines.
* **AIEvent:** An immutable log of every raw detection received from the edge (The "Source of Truth").
* **WorkstationSession:** Calculated intervals representing continuous time spent in a specific state (Working, Idle, or Malfunction).
* **WorkstationDailyStats:** A pre-aggregated table updated in real-time to allow for sub-second dashboard loading.

## 📈 Metric Definitions

| Metric | Calculation | Definition |
| :--- | :--- | :--- |
| **Occupancy** | $WorkingTime + IdleTime$ | Total time a worker was present at a specific station. |
| **Utilization %** | $(WorkingTime / Occupancy) \times 100$ | Percentage of occupied time spent in active production. |
| **Total Units** | Sum of all `PRODUCT_COUNT` events | The absolute output of the worker or workstation. |
| **Throughput** | $TotalUnits / OccupancyHours$ | The production rate per hour of presence. |

---

## 🛠 Resilience & Edge Handling

### 1. Intermittent Connectivity
The system implements a **Heartbeat Monitor** via a background cron job. If the backend fails to receive a raw event from a workstation within a **15-minute threshold**, the system assumes a connectivity or hardware failure. It automatically closes the active worker session and opens a "Malfunction" session to ensure downtime is accurately recorded.

### 2. Duplicate Events
The backend employs **State-Aware Logic**. It checks the current state of a workstation before processing a new event. If the edge sends redundant signals (e.g., multiple "WORKING" events without an "IDLE" transition), the system ignores the duplicates to maintain clean session intervals.

### 3. Out-of-Order Timestamps
To handle network latency, the ingestion engine sorts all incoming event payloads by their **original edge timestamp** before they enter the state machine. This ensures that session durations are calculated based on when the event *occurred*, not when it *arrived*.

---

## 🧠 AI & MLOps (Theoretical)

### Model Versioning
I would include a `model_version` tag in the `AIEvent` table. This allows us to track performance differences between various model iterations and perform rollbacks if a new model version begins producing inaccurate data.

### Detecting Model Drift
Model drift can be detected by monitoring the **Confidence Score Trend**. If the rolling average confidence for specific events (like `PRODUCT_COUNT`) drops below a set baseline (e.g., 85%), it indicates that the model is no longer fitting the current factory environment (e.g., due to lighting changes or new worker uniforms).

### Triggering Retraining
Retraining is triggered via **Exception Logging**. When a manager manually overrides or flags a system event as "Incorrect" in the dashboard, that data is moved to a "Retraining Queue." Once the queue reaches a significant sample size, the model is retrained on these new, verified edge cases.

---

## 🚀 Scaling Strategy

* **5 Cameras:** The current monolithic Node.js setup is sufficient.
* **100+ Cameras:** I would move to an **Asynchronous Architecture** using a message queue (e.g., Redis or RabbitMQ). This would decouple event ingestion from metric calculation, ensuring the API remains responsive during high-traffic spikes.
* **Multi-Site:** I would implement a **Hub-and-Spoke** model. Each factory site would have a local gateway for edge aggregation, syncing only summarized data to a global Cloud Data Warehouse for executive reporting.

---

## 📝 Assumptions and Tradeoffs

* **Assumption:** The system assumes that every production event is tied to the worker currently assigned to that workstation's session.
* **Tradeoff:** I chose **PostgreSQL** over NoSQL for its strong relational integrity. While NoSQL offers faster ingestion, the requirement for 100% accurate session calculations and financial-grade reporting makes SQL the more reliable choice for industrial analytics.