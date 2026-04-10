"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const heartbeat_service_1 = require("./services/heartbeat.service");
const worker_route_1 = __importDefault(require("./routers/worker.route"));
const workstation_route_1 = __importDefault(require("./routers/workstation.route"));
const event_route_1 = __importDefault(require("./routers/event.route"));
const analytics_route_1 = __importDefault(require("./routers/analytics.route"));
const seed_route_1 = __importDefault(require("./routers/seed.route"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/workers', worker_route_1.default);
app.use('/api/workstations', workstation_route_1.default);
app.use('/api/events', event_route_1.default);
app.use('/api/analytics', analytics_route_1.default);
app.use('/api/seed', seed_route_1.default);
// Health Check
app.get('/health', (req, res) => res.send('Backend is alive! 🚀'));
app.listen(PORT, () => {
    console.log(`
  ✅ Server is running on http://localhost:${PORT}
  📡 Heartbeat Monitor: ACTIVE
  🛠  System Ready for Seeding
  `);
    // Start the background cron job for malfunction detection
    (0, heartbeat_service_1.startHeartbeatMonitor)();
});
