import { Request, Response, NextFunction } from 'express';
import { prisma } from '../../config/prisma';

export class DashboardController {
  async getBootstrap(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const role = (req as any).user.role;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { operator: true }
      });

      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      let activeTrips = 0;
      let activeDrivers = 0;
      let activeBuses = 0;

      if (user.operatorId) {
        activeTrips = await prisma.trip.count({
          where: { route: { operatorId: user.operatorId }, status: 'ONGOING' }
        });

        const activeAssignments = await prisma.tripAssignment.findMany({
          where: {
            trip: { route: { operatorId: user.operatorId }, status: 'ONGOING' },
            isActive: true
          }
        });

        activeDrivers = new Set(activeAssignments.map(a => a.driverId).filter(Boolean)).size;
        activeBuses = new Set(activeAssignments.map(a => a.busId).filter(Boolean)).size;
      }

      res.json({
        user: {
          id: user.id,
          role: user.role,
        },
        operator: user.operator ? {
          id: user.operator.id,
          name: user.operator.name
        } : null,
        stats: {
          activeTrips,
          activeDrivers,
          activeBuses
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

export const dashboardController = new DashboardController();
