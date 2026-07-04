import { Router, Request, Response, NextFunction } from 'express';
import { dashboardController } from './dashboard.controller';
import { requireAuth } from '../../middleware/auth.middleware';

export const dashboardRoutes = Router();

dashboardRoutes.get('/bootstrap', requireAuth, dashboardController.getBootstrap);
