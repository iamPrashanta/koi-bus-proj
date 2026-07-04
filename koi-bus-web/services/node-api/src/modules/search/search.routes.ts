import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

router.get('/', searchController.searchRoutes);
router.get('/nearby', searchController.searchNearbyBuses);

export const searchRoutes = router;
