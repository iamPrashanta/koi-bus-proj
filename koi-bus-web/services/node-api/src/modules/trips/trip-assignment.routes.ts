import { Router, Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { prisma } from '../../config/prisma';

export const tripAssignmentRoutes = Router({ mergeParams: true });

// POST /api/trips/:id/assign-driver
tripAssignmentRoutes.post('/assign-driver', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  const { driverId } = req.body;
  
  if (isNaN(tripId) || !driverId) {
    return res.status(400).json({ error: 'Invalid tripId or driverId' });
  }

  try {
    const existing = await prisma.tripAssignment.findFirst({ where: { tripId, isActive: true } });

    if (existing) {
      await prisma.tripAssignment.update({
        where: { id: existing.id },
        data: { isActive: false, unassignedAt: new Date() }
      });
    }

    const assignment = await prisma.tripAssignment.create({
      data: {
        tripId,
        driverId,
        busId: existing?.busId,
        deviceId: existing?.deviceId,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: req.user?.userId || null
      }
    });

    res.json({ success: true, data: assignment });
  } catch (error) {
    console.error('Assign driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trips/:id/assign-bus
tripAssignmentRoutes.post('/assign-bus', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  const { busId } = req.body;
  
  if (isNaN(tripId) || !busId) {
    return res.status(400).json({ error: 'Invalid tripId or busId' });
  }

  try {
    const existing = await prisma.tripAssignment.findFirst({ where: { tripId, isActive: true } });

    if (existing) {
      await prisma.tripAssignment.update({
        where: { id: existing.id },
        data: { isActive: false, unassignedAt: new Date() }
      });
    }

    const assignment = await prisma.tripAssignment.create({
      data: {
        tripId,
        driverId: existing?.driverId,
        busId,
        deviceId: existing?.deviceId,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: req.user?.userId || null
      }
    });

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/trips/:id/assign-device
tripAssignmentRoutes.post('/assign-device', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  const { deviceId } = req.body;
  
  if (isNaN(tripId) || !deviceId) {
    return res.status(400).json({ error: 'Invalid tripId or deviceId' });
  }

  try {
    const existing = await prisma.tripAssignment.findFirst({ where: { tripId, isActive: true } });

    if (existing) {
      await prisma.tripAssignment.update({
        where: { id: existing.id },
        data: { isActive: false, unassignedAt: new Date() }
      });
    }

    const assignment = await prisma.tripAssignment.create({
      data: {
        tripId,
        driverId: existing?.driverId,
        busId: existing?.busId,
        deviceId,
        isActive: true,
        assignedAt: new Date(),
        assignedBy: req.user?.userId || null
      }
    });

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trips/:id/assign-driver
tripAssignmentRoutes.delete('/assign-driver', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  
  try {
    await prisma.tripAssignment.updateMany({
      where: { tripId, isActive: true },
      data: { driverId: null }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trips/:id/assign-bus
tripAssignmentRoutes.delete('/assign-bus', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  
  try {
    await prisma.tripAssignment.updateMany({
      where: { tripId, isActive: true },
      data: { busId: null }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /api/trips/:id/assign-device
tripAssignmentRoutes.delete('/assign-device', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  
  try {
    await prisma.tripAssignment.updateMany({
      where: { tripId, isActive: true },
      data: { deviceId: null }
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/trips/:id/assignment
tripAssignmentRoutes.get('/assignment', async (req: AuthRequest, res: Response) => {
  const tripId = parseInt(req.params.id as string);
  
  try {
    const assignment = await prisma.tripAssignment.findFirst({
      where: { tripId, isActive: true },
      include: {
        driver: { select: { id: true, licenseNo: true, user: { select: { phone: true } } } },
        bus: { select: { id: true, registrationNumber: true } },
        device: { select: { id: true, serialNumber: true } }
      }
    });

    res.json({ success: true, data: assignment });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' });
  }
});
