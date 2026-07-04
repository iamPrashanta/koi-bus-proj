import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/errorHandler';
import swaggerUi from 'swagger-ui-express';
import swaggerJsdoc from 'swagger-jsdoc';

import { searchRoutes } from './modules/search/search.routes';

const app = express();

// CORS: Allow the Next.js frontend. The API runs on 3000, frontend on 3001.
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3001';
app.use(cors({
  origin: [FRONTEND_URL],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.static('public'));

// Swagger Setup
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Koi Bus API',
      version: '2.0.0',
      description: 'Google Maps for West Bengal Buses - Routing Engine API',
    },
    servers: [ { url: 'http://localhost:3000' } ],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};
const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import { routesApi } from './modules/routes/route.routes';
import { stopsApi } from './modules/stops/stop.routes';
import { tripsApi } from './modules/trips/trip.routes';
import { faresApi } from './modules/fares/fare.routes';
import { busesApi } from './modules/buses/bus.routes';
import { authRoutes } from './modules/auth/auth.routes';
import { telemetryRoutes } from './modules/telemetry/telemetry.routes';

import { adminRoutes } from './modules/admin/admin.routes';
import { operatorRoutes } from './modules/operators/operator.routes';
import { healthRoutes } from './modules/health/health.routes';
import { dashboardRoutes } from './modules/dashboard/dashboard.routes';
import { driverRoutes } from './modules/driver/driver.routes';
// Register routes
app.use('/api/auth', authRoutes);
app.use('/api/telemetry', telemetryRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/routes', routesApi);
app.use('/api/stops', stopsApi);
app.use('/api/trips', tripsApi);
app.use('/api/fares', faresApi);
app.use('/api/buses', busesApi);
app.use('/api/admin', adminRoutes);
app.use('/api/operators', operatorRoutes);
app.use('/api/driver', driverRoutes);
app.use('/api', healthRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.use(errorHandler);

export default app;
