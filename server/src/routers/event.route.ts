import { Router } from 'express';
import { processAIEvent } from '../services/event.service';

const router = Router();

router.post('/', async (req, res) => {
  try {
    // Basic validation of the payload could be added here or via middleware
    const result = await processAIEvent(req.body);
    res.status(200).json(result);
  } catch (error: any) {
    console.error('Event Error:', error.message);
    res.status(400).json({ error: error.message });
  }
});

export default router;