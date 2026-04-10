import { Router } from 'express';
import { addWorkstation } from '../controllers/workstation';

const router = Router();

router.post('/', addWorkstation);

export default router;