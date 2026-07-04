import http from 'http';
import jwt from 'jsonwebtoken';
import { createClient } from 'redis';

const TRIP_ID = 1;
const HOST = 'localhost';
const PORT = 3000;
const INTERVAL_MS = 2000;
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_koi_bus_key_1234'; // from env.ts defaults

// Generate a dummy driver token
const token = jwt.sign({ userId: 999, role: 'DRIVER' }, JWT_SECRET, { expiresIn: '1h' });

// Kolkata start coordinate (approx)
let currentLat = 22.5726;
let currentLng = 88.3639;
let pointsProcessed = 0;

const redisClient = createClient({ url: process.env.REDIS_URL || 'redis://127.0.0.1:16379' });
redisClient.connect().catch(console.error);

console.log(`Starting GPS Simulator for Trip ${TRIP_ID}...`);

setInterval(async () => {
  // Simulate movement (roughly north-east)
  currentLat += (Math.random() * 0.001);
  currentLng += (Math.random() * 0.001);
  const speed = 20 + Math.random() * 30; // 20-50 km/h
  const heading = 45 + Math.random() * 10; // degrees

  const payload = JSON.stringify({
    tripId: TRIP_ID,
    latitude: currentLat,
    longitude: currentLng,
    speed: speed,
    heading: heading,
    accuracy: 5.0,
    capturedAt: new Date().toISOString()
  });

  const options = {
    hostname: HOST,
    port: PORT,
    path: '/api/telemetry/live',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(payload),
      'Authorization': `Bearer ${token}`
    }
  };

  const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log(`[Sent] Lat: ${currentLat.toFixed(5)}, Lng: ${currentLng.toFixed(5)}, Speed: ${speed.toFixed(1)} km/h`);
      } else {
        console.error(`[Error] Status ${res.statusCode}: ${responseBody}`);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`[Request Error] ${e.message}`);
  });

  req.write(payload);
  req.end();

  pointsProcessed++;
  await redisClient.set('simulator:status', JSON.stringify({
    running: true,
    tripId: TRIP_ID,
    pointsProcessed,
    updatedAt: new Date().toISOString()
  }), { EX: 10 }); // expire in 10s if simulator dies

}, INTERVAL_MS);
