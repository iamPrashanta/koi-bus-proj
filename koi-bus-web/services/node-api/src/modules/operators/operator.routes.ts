import { Router } from 'express';
import { operatorController } from './operator.controller';

const router = Router();

router.get('/:id/dashboard', operatorController.getDashboard);
router.get('/:id/live-map', operatorController.getLiveMap);

export const operatorRoutes = router;
