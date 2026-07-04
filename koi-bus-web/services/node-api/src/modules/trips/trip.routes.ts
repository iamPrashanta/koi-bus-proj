import { Router } from 'express';
import { tripController } from './trip.controller';
import { tripAssignmentRoutes } from './trip-assignment.routes';

const router = Router();

router.get('/', tripController.getAll);
router.get('/active', tripController.getActive);
router.get('/buses/active', tripController.getActiveBuses);
router.get('/:id/details', tripController.getDetails);
router.use('/:id', tripAssignmentRoutes);
router.get('/:id', tripController.getOne);
router.post('/', tripController.create);
router.put('/:id', tripController.update);
router.delete('/:id', tripController.delete);

// Trip Operations
router.post('/:id/start', tripController.start);
router.post('/:id/pause', tripController.pause);
router.post('/:id/resume', tripController.resume);
router.post('/:id/end', tripController.end);

// Trip Telemetry
router.get('/:id/live', tripController.live);
router.get('/:id/replay', tripController.replay);

export const tripsApi = router;
