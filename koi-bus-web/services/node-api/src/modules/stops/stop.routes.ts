import { Router } from 'express';
import { stopController } from './stop.controller';

const router = Router();

router.get('/', stopController.getAll);
router.get('/:id', stopController.getOne);
router.post('/', stopController.create);
router.put('/:id', stopController.update);
router.delete('/:id', stopController.delete);

export const stopsApi = router;
