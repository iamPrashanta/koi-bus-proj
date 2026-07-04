import { Router } from 'express';
import { busController } from './bus.controller';

const router = Router();

router.get('/', busController.getAll);
router.get('/:id', busController.getOne);
router.post('/', busController.create);
router.put('/:id', busController.update);
router.delete('/:id', busController.delete);

// GPS Tracking migrated to Telemetry module

export const busesApi = router;
