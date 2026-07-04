import { Router } from 'express';
import { liveTelemetry, bulkTelemetry } from './telemetry.controller';
import { verifyToken, requireRole } from '../../middleware/auth.middleware';

export const telemetryRoutes = Router();

// Only drivers should be able to post telemetry
telemetryRoutes.post('/live', verifyToken, requireRole(['DRIVER']), liveTelemetry);
telemetryRoutes.post('/bulk', verifyToken, requireRole(['DRIVER']), bulkTelemetry);

// Hardware device ingest endpoint (secured by device secret in production, open for emulator)
telemetryRoutes.post('/ingest', liveTelemetry);
