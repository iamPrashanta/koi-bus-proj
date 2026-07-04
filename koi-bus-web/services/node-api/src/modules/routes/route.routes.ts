import { Router } from 'express';
import { routeController } from './route.controller';

const router = Router();

router.get('/', routeController.getAll);
router.get('/:id', routeController.getOne);
router.post('/', routeController.create);
router.put('/:id', routeController.update);
router.delete('/:id', routeController.delete);

export const routesApi = router;
