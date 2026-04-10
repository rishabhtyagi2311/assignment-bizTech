import { Router } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const router = Router();

router.get('/factory', async (req, res) => {
  const date = req.query.date ? new Date(req.query.date as string) : new Date();
  date.setUTCHours(0,0,0,0);
  const stats = await AnalyticsService.getFactoryStats(date);
  res.json(stats);
});



router.get('/workstations', async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    
    const stats = await AnalyticsService.getAllWorkstationsStats(date);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});


router.get('/workers', async (req, res) => {
  try {
    const date = req.query.date ? new Date(req.query.date as string) : new Date();
    date.setUTCHours(0, 0, 0, 0);
    
    const stats = await AnalyticsService.getAllWorkersStats(date);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recent', async (req, res) => {
  try {
    const events = await AnalyticsService.getRecentActivity();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;