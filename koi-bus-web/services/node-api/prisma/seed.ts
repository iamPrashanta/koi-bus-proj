import { PrismaClient, EdgeType, RouteDirection, ServiceType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting Realistic West Bengal Routing Seed...');

  // Truncate all tables to prevent foreign key errors
  console.log('Truncating tables...');
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE
      "ActiveTripSession", "TripAssignment", "SavedJourney", "OccupancyReport",
      "Report", "ImportJob", "Driver", "UserSession", "RefreshToken", "UserProfile",
      "User", "TripLocation", "Trip", "StopConnection", "RouteStop", "RouteVersion",
      "Fare", "Bus", "Device", "Route", "Stop", "Operator", "Metadata"
    CASCADE;
  `);
  console.log('Truncation complete.');

  // Create one user of each type
  console.log('Creating mock users...');
  const passwordHash = await bcrypt.hash('password123', 12);
  
  await prisma.user.create({ data: { phone: '1111111111', passwordHash, role: 'SUPER_ADMIN', firstName: 'Super', lastName: 'Admin', profile: { create: {} } } });
  await prisma.user.create({ data: { phone: '2222222222', passwordHash, role: 'BUS_OWNER', firstName: 'Bus', lastName: 'Owner', profile: { create: {} } } });
  await prisma.user.create({ data: { phone: '3333333333', passwordHash, role: 'DRIVER', firstName: 'Driver', lastName: 'User', profile: { create: {} } } });
  await prisma.user.create({ data: { phone: '4444444444', passwordHash, role: 'PASSENGER', firstName: 'Passenger', lastName: 'User', profile: { create: {} } } });
  console.log('Mock users created.');

  // 1. Create Operators
  const wbtc = await prisma.operator.create({ data: { code: 'WBTC', name: 'West Bengal Transport Corporation', type: 'WBTC' } });
  const sbstc = await prisma.operator.create({ data: { code: 'SBSTC', name: 'South Bengal State Transport Corporation', type: 'SBSTC' } });
  const nbstc = await prisma.operator.create({ data: { code: 'NBSTC', name: 'North Bengal State Transport Corporation', type: 'NBSTC' } });
  const cstc = await prisma.operator.create({ data: { code: 'CSTC', name: 'Calcutta State Transport Corporation', type: 'CSTC' } });

  // 2. Create Stops (with mock coordinates)
  const stopsData = [
    { name: 'Durgapur', city: 'Durgapur' },
    { name: 'Panagarh', city: 'Panagarh' },
    { name: 'Burdwan', city: 'Burdwan' },
    { name: 'Dankuni', city: 'Dankuni' },
    { name: 'Howrah', city: 'Howrah' },
    { name: 'Esplanade', city: 'Kolkata' },
    { name: 'Bankura', city: 'Bankura' },
    { name: 'Sonamukhi', city: 'Sonamukhi' },
    { name: 'Salt Lake', city: 'Kolkata' },
    { name: 'Karunamoyee', city: 'Kolkata' },
    { name: 'Asansol', city: 'Asansol' },
    { name: 'Raniganj', city: 'Raniganj' },
  ];

  const stops: Record<string, any> = {};
  for (const s of stopsData) {
    stops[s.name] = await prisma.stop.create({
      data: { name: s.name, city: s.city, latitude: 22.0, longitude: 88.0 } // simplified coords
    });
  }

  // 3. Create Routes & Edges Function
  async function createRouteWithGraph(code: string, name: string, operatorId: number, stopNames: string[], serviceType: ServiceType) {
    const route = await prisma.route.create({
      data: { code, name, operatorId, isActive: true }
    });

    const routeVersion = await prisma.routeVersion.create({
      data: { routeId: route.id, version: 1 }
    });

    const stopList = stopNames.map(name => stops[name]);

    for (let i = 0; i < stopList.length; i++) {
      await prisma.routeStop.create({
        data: {
          routeVersionId: routeVersion.id,
          stopId: stopList[i].id,
          sequence: i + 1,
          distanceKm: i * 5.0
        }
      });
    }

    // Create Edges (FORWARD)
    for (let i = 0; i < stopList.length - 1; i++) {
      await prisma.stopConnection.create({
        data: {
          fromStopId: stopList[i].id,
          toStopId: stopList[i + 1].id,
          routeId: route.id,
          direction: RouteDirection.FORWARD,
          edgeType: EdgeType.ROUTE,
          serviceType,
          distanceMeters: 5000,
          estimatedMinutes: 15,
          fareAmount: 10
        }
      });
    }
    
    return route;
  }

  // Corridor 1: Durgapur -> Panagarh -> Burdwan -> Dankuni -> Howrah -> Esplanade
  const c1 = await createRouteWithGraph('C1', 'SBSTC South', sbstc.id, ['Durgapur', 'Panagarh', 'Burdwan', 'Dankuni', 'Howrah', 'Esplanade'], ServiceType.EXPRESS);

  // Corridor 2: Bankura -> Sonamukhi -> Durgapur
  const c2 = await createRouteWithGraph('C2', 'NBSTC Central', nbstc.id, ['Bankura', 'Sonamukhi', 'Durgapur'], ServiceType.LOCAL);

  // Corridor 3: Salt Lake -> Karunamoyee -> Esplanade -> Howrah
  const c3 = await createRouteWithGraph('C3', 'WBTC Metro', wbtc.id, ['Salt Lake', 'Karunamoyee', 'Esplanade', 'Howrah'], ServiceType.AC);

  // Corridor 4: Asansol -> Raniganj -> Durgapur
  const c4 = await createRouteWithGraph('C4', 'CSTC West', cstc.id, ['Asansol', 'Raniganj', 'Durgapur'], ServiceType.SUPER);


  // 4. Create Transfer Edges
  async function createTransfer(stopName: string, fromRouteId: number, toRouteId: number) {
    const stop = stops[stopName];
    await prisma.stopConnection.create({
      data: {
        fromStopId: stop.id,
        toStopId: stop.id,
        edgeType: EdgeType.TRANSFER,
        fromRouteId,
        toRouteId,
        distanceMeters: 0,
        estimatedMinutes: 5,
        transferCost: 1, // Penalty for transferring
        fareAmount: 0
      }
    });
  }

  // Transfers at Durgapur
  await createTransfer('Durgapur', c2.id, c1.id); // Bankura -> Esplanade via Durgapur
  await createTransfer('Durgapur', c4.id, c1.id); // Asansol -> Esplanade via Durgapur

  // Transfers at Esplanade
  await createTransfer('Esplanade', c1.id, c3.id); // Durgapur -> Esplanade -> Salt Lake

  // Transfers at Howrah
  await createTransfer('Howrah', c1.id, c3.id);
  await createTransfer('Howrah', c3.id, c1.id);

  // 5. Create a Mock Trip 1 for Simulator Testing
  await prisma.trip.create({
    data: {
      id: 1,
      routeId: c1.id,
      startTime: new Date(),
      busType: 'AC',
      status: 'ONGOING'
    }
  });

  console.log('V2 Realistic Seed Completed.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
