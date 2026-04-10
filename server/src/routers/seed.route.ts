import { Router, Request, Response } from 'express';
import { SeedService } from '../services/seed.service';
import { prisma } from '../lib/prisma.js';
import { EventType } from '../types/index.js';

const router = Router();


router.get('/check', async (req: Request, res: Response) => {
  try {
    const workerCount = await prisma.worker.count();
    
    if (workerCount === 0) {
      await SeedService.seedDefaultData();
      return res.status(201).json({ 
        status: 'seeded', 
        message: 'Database was empty. Initialized with default 6 workers and stations.' 
      });
    }

    res.status(200).json({ 
      status: 'exists', 
      message: 'Database already contains data. No auto-seed required.' 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Initialization check failed', details: error.message });
  }
});

router.post('/refresh', async (req: Request, res: Response) => {
  try {
    await SeedService.clearDatabase()
    await SeedService.seedDefaultData();
    res.status(200).json({ 
      message: 'System reset and refreshed with default demonstration data.' 
    });
  } catch (error: any) {
    res.status(500).json({ error: 'Refresh failed', details: error.message });
  }
});


router.post('/custom', async (req: Request, res: Response) => {
  try {
    const { workers, workstations, events } = req.body;
    if (!workers || !workstations || !events) {
      return res.status(400).json({ 
        error: 'Invalid payload. JSON must contain workers, workstations, and events arrays.' 
      });
    }

    await SeedService.seedCustomData(req.body);
    res.status(200).json({ message: 'Custom data processed and timeline generated successfully.' });
  } catch (error: any) {
    res.status(400).json({ error: 'Custom seeding failed', details: error.message });
  }
});


router.get('/template', (req: Request, res: Response) => {
  const template = {
    workers: [{ worker_id: 'W1', name: 'John Doe' }],
    workstations: [{ station_id: 'S1', name: 'Assembly Line Alpha' }],
    events: [
      {
        worker_id: 'W1',
        workstation_id: 'S1',
        event_type: EventType.WORKING,
        timestamp: new Date().toISOString(),
        confidence: 0.95
      },
      {
        worker_id: 'W1',
        workstation_id: 'S1',
        event_type: EventType.PRODUCT_COUNT,
        timestamp: new Date(Date.now() + 1000 * 60).toISOString(),
        count: 5
      }
    ]
  };
  res.json(template);
});

export default router;