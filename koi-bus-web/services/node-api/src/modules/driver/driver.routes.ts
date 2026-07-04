import { Router } from 'express';
import { prisma } from '../../config/prisma';
import { requireAuth, AuthRequest } from '../../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/driver/assignment
 * Returns the active trip assignment for the authenticated driver.
 * Chain: User → Driver → TripAssignment → Trip → Route → Bus → Device
 */
router.get('/assignment', requireAuth, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;

    // Resolve the Driver record from the authenticated user
    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: { user: true },
    });

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'No driver profile found for this account. Contact your operator.',
      });
    }

    // Find the active assignment for this driver
    const assignment = await prisma.tripAssignment.findFirst({
      where: {
        driverId: driver.id,
        isActive: true,
      },
      include: {
        trip: {
          include: { route: true },
        },
        bus: true,
        device: true,
        driver: {
          include: { user: true },
        },
      },
      orderBy: { id: 'desc' },
    });

    if (!assignment) {
      return res.json({ success: true, data: null });
    }

    const { trip, bus, device } = assignment;

    return res.json({
      success: true,
      data: {
        tripId: trip.id,
        routeName: trip.route?.name || 'Unknown Route',
        routeCode: trip.route?.code || '',
        busNumber: bus?.registrationNumber || bus?.id?.toString() || 'Unknown',
        deviceId: device?.serialNumber || device?.id?.toString() || 'N/A',
        driverName: `${driver.user.firstName || ''} ${driver.user.lastName || ''}`.trim() || 'Driver',
        shiftStart: trip.startTime?.toISOString() || new Date().toISOString(),
        status: trip.status,
      },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, error: error.message });
  }
});

export const driverRoutes = router;
