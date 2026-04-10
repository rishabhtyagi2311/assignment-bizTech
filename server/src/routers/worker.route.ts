import { Router } from 'express';
import { addWorker, getAllWorkers } from '../controllers/worker';

const router = Router();

router.post('/', addWorker);
router.get('/', getAllWorkers);

export default router;