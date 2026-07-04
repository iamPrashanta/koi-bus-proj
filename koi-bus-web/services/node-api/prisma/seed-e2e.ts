import { PrismaClient, OperatorType, BusType, UserRole } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Idempotent E2E Seeding...');

  // 1. Roles & Passwords
  const passwordHash = await bcrypt.hash('password123', 10);
  
  // 2. Operator
  const operator = await prisma.operator.upsert({
    where: { code: 'KOI-E2E' },
    update: {},
    create: {
      code: 'KOI-E2E',
      name: 'Koi Transport (E2E)',
      type: OperatorType.PRIVATE
    }
  });

  // 3. Operator User
  const operatorUser = await prisma.user.upsert({
    where: { phone: '9876543210' },
    update: {},
    create: {
      phone: '9876543210',
      passwordHash,
      firstName: 'Test',
      lastName: 'Operator',
      role: UserRole.BUS_OWNER,
      operatorId: operator.id
    }
  });

  // 4. Driver User & Profile
  const driverUser = await prisma.user.upsert({
    where: { phone: '9876543211' },
    update: {},
    create: {
      phone: '9876543211',
      passwordHash,
      firstName: 'Test',
      lastName: 'Driver',
      role: UserRole.DRIVER,
      operatorId: operator.id
    }
  });

  const driver = await prisma.driver.upsert({
    where: { userId: driverUser.id },
    update: {},
    create: {
      userId: driverUser.id,
      licenseNo: 'WB-DL-E2E-001'
    }
  });

  // 5. Passenger User
  const passengerUser = await prisma.user.upsert({
    where: { phone: '9876543212' },
    update: {},
    create: {
      phone: '9876543212',
      passwordHash,
      firstName: 'Test',
      lastName: 'Passenger',
      role: UserRole.PASSENGER
    }
  });

  // 6. Route
  let route = await prisma.route.findFirst({
    where: { code: 'DGP-KAR-E2E' }
  });

  if (!route) {
    route = await prisma.route.create({
      data: {
        code: 'DGP-KAR-E2E',
        name: 'Durgapur to Karunamoyee',
        operatorId: operator.id,
        isActive: true
      }
    });
  }

  // 7. Route Version
  let routeVersion = await prisma.routeVersion.findFirst({
    where: { routeId: route.id, version: 1 }
  });

  if (!routeVersion) {
    routeVersion = await prisma.routeVersion.create({
      data: {
        routeId: route.id,
        version: 1
      }
    });
  }

  // 8. Stops
  const stopsData = [
    { name: 'Durgapur Bus Stand (E2E)', lat: 23.5186, lng: 87.3167, seq: 1 },
    { name: 'Muchipara (E2E)', lat: 23.5120, lng: 87.3367, seq: 2 },
    { name: 'Benachity (E2E)', lat: 23.4980, lng: 87.3567, seq: 3 },
    { name: 'Panagarh (E2E)', lat: 23.4680, lng: 87.4250, seq: 4 },
    { name: 'Dankuni (E2E)', lat: 22.6820, lng: 88.3100, seq: 5 },
    { name: 'Karunamoyee (E2E)', lat: 22.5815, lng: 88.4262, seq: 6 },
  ];

  for (const stop of stopsData) {
    let existingStop = await prisma.stop.findFirst({
      where: { name: stop.name }
    });
    
    if (!existingStop) {
      existingStop = await prisma.stop.create({
        data: {
          name: stop.name,
          latitude: stop.lat,
          longitude: stop.lng,
          city: 'West Bengal'
        }
      });
    }

    const routeStop = await prisma.routeStop.findFirst({
      where: { routeVersionId: routeVersion.id, stopId: existingStop.id }
    });

    if (!routeStop) {
      await prisma.routeStop.create({
        data: {
          routeVersionId: routeVersion.id,
          stopId: existingStop.id,
          sequence: stop.seq,
          distanceKm: stop.seq * 5
        }
      });
    }
  }

  // 9. Bus
  const bus = await prisma.bus.upsert({
    where: { registrationNumber: 'WB-E2E-1234' },
    update: {},
    create: {
      registrationNumber: 'WB-E2E-1234',
      operatorId: operator.id,
      routeId: route.id
    }
  });

  // 10. Device
  const device = await prisma.device.upsert({
    where: { serialNumber: 'DEV-E2E-001' },
    update: {},
    create: {
      serialNumber: 'DEV-E2E-001',
      busId: bus.id,
      isActive: true
    }
  });

  // Fix sequences to prevent unique constraint failures caused by manual inserts in other scripts
  const tables = ['Trip', 'TripAssignment', 'Route', 'RouteVersion', 'Stop', 'RouteStop', 'Bus', 'Device', 'User', 'Operator', 'Driver'];
  for (const table of tables) {
    try {
      await prisma.$executeRawUnsafe(`SELECT setval(pg_get_serial_sequence('"${table}"', 'id'), coalesce(max(id), 1), max(id) IS NOT null) FROM "${table}";`);
    } catch(e) {
      // Ignore if table doesn't have an id sequence (like RouteStop)
    }
  }

  // 11. Trip
  let trip = await prisma.trip.findFirst({
    where: { routeId: route.id, status: 'SCHEDULED' }
  });

  if (!trip) {
    trip = await prisma.trip.create({
      data: {
        routeId: route.id,
        startTime: new Date(Date.now() + 3600000), // 1 hour from now
        status: 'SCHEDULED',
        busType: BusType.EXPRESS
      }
    });
  }

  // 12. Trip Assignment
  const existingAssignment = await prisma.tripAssignment.findFirst({
    where: { tripId: trip.id, driverId: driver.id }
  });

  if (!existingAssignment) {
    await prisma.tripAssignment.updateMany({
      where: { driverId: driver.id, isActive: true },
      data: { isActive: false, unassignedAt: new Date() }
    });

    await prisma.tripAssignment.create({
      data: {
        tripId: trip.id,
        busId: bus.id,
        driverId: driver.id,
        deviceId: device.id,
        assignedBy: operatorUser.id,
        isActive: true,
        assignedAt: new Date()
      }
    });
  }

  console.log('✅ E2E Seeding Complete!');
  console.log(`
Test Accounts:
Operator: +919876543210 (password123)
Driver:   +919876543211 (password123)
Passenger: +919876543212 (password123)
  `);
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
