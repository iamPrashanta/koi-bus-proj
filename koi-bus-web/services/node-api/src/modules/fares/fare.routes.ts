import { Router } from 'express';
import { fareController } from './fare.controller';

const router = Router();

router.get('/', fareController.getAll);
router.get('/:id', fareController.getOne);
router.post('/', fareController.create);
router.put('/:id', fareController.update);
router.delete('/:id', fareController.delete);

export const faresApi = router;
