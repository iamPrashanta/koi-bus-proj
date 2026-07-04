import { Router } from 'express';
import { getTile } from './maps.controller';

const router = Router();

router.get('/tiles/:z/:x/:y.png', getTile);
// Support optional extension-less requests
router.get('/tiles/:z/:x/:y', getTile);

export default router;
