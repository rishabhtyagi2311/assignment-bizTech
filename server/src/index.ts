import express from 'express';
import cors from 'cors';
import { startHeartbeatMonitor } from './services/heartbeat.service';


import workerRoutes from './routers/worker.route';
import stationRoutes from './routers/workstation.route';
import eventRoutes from './routers/event.route';
import analyticsRoutes from './routers/analytics.route';
import seedRoutes from './routers/seed.route';

const app = express();
const PORT = process.env.PORT || 3000;


app.use(cors()); 
app.use(express.json());

// Routes
app.use('/api/workers', workerRoutes);
app.use('/api/workstations', stationRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/seed', seedRoutes);

// Health Check
app.get('/health', (req, res) => res.send('Backend is alive! 🚀'));



app.listen(Number(PORT), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  startHeartbeatMonitor();
});