import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { program } from 'commander';

program
  .requiredOption('--trip <id>', 'Trip ID')
  .requiredOption('--device <id>', 'Device Serial Number')
  .requiredOption('--route <file>', 'GeoJSON route file path')
  .option('--speed <multiplier>', 'Speed multiplier', '1')
  .option('--loop', 'Loop the route', false)
  .option('--offline', 'Stops sending GPS data', false)
  .option('--poor-gps', 'Add random +-10m inaccuracy', false)
  .option('--slow-network', 'Delay packets', false)
  .option('--packet-loss <percent>', 'Drop X% of updates', '0')
  .parse(process.argv);

const options = program.opts();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

async function runEmulator() {
  console.log(`🚀 Starting Telemetry Emulator for Device: ${options.device} (Trip: ${options.trip})`);
  
  if (options.offline) {
    console.log('⚠️  Offline mode enabled. No data will be sent.');
    return;
  }

  const routePath = path.resolve(process.cwd(), options.route);
  if (!fs.existsSync(routePath)) {
    console.error(`❌ Route file not found: ${routePath}`);
    process.exit(1);
  }

  const geojson = JSON.parse(fs.readFileSync(routePath, 'utf8'));
  const coordinates = geojson.features[0].geometry.coordinates;

  console.log(`📍 Loaded route with ${coordinates.length} waypoints.`);
  console.log(`⚙️  Speed Multiplier: ${options.speed}x`);
  if (options.poorGps) console.log('⚠️  Poor GPS enabled (±10m random noise)');
  if (options.slowNetwork) console.log('⚠️  Slow Network enabled (random delays)');
  if (parseInt(options.packetLoss) > 0) console.log(`⚠️  Packet Loss: ${options.packetLoss}%`);

  let currentIndex = 0;
  
  const sendLocation = async () => {
    if (currentIndex >= coordinates.length) {
      if (options.loop) {
        currentIndex = 0;
      } else {
        console.log('🏁 Route completed.');
        process.exit(0);
      }
    }

    // Packet Loss Simulation
    const packetLossRate = parseInt(options.packetLoss) / 100;
    if (Math.random() < packetLossRate) {
      console.log('🛑 Packet dropped due to packet loss simulation.');
      currentIndex++;
      scheduleNext();
      return;
    }

    let [lng, lat] = coordinates[currentIndex];

    // Poor GPS Simulation
    if (options.poorGps) {
      const noise = (Math.random() - 0.5) * 0.0002; // approx 20 meters
      lat += noise;
      lng += noise;
    }

    const payload = {
      deviceId: options.device,
      tripId: parseInt(options.trip),
      latitude: lat,
      longitude: lng,
      speed: 40 * parseFloat(options.speed),
      heading: 142, // Static for now, could be calculated based on next point
      accuracy: options.poorGps ? 15 : 5,
      capturedAt: new Date().toISOString()
    };

    // Slow Network Simulation
    if (options.slowNetwork) {
      const delay = Math.random() * 3000 + 1000;
      console.log(`⏳ Slow network... delaying ${Math.round(delay)}ms`);
      await new Promise(r => setTimeout(r, delay));
    }

    try {
      await axios.post(`${API_URL}/telemetry/ingest`, payload);
      console.log(`✅ Sent Location [${currentIndex}/${coordinates.length}]: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
    } catch (err: any) {
      console.error(`❌ Failed to send telemetry: ${err.response?.data?.error || err.message}`);
    }

    currentIndex++;
    scheduleNext();
  };

  const scheduleNext = () => {
    const baseInterval = 3000;
    const interval = baseInterval / parseFloat(options.speed);
    setTimeout(sendLocation, interval);
  };

  // Start the loop
  sendLocation();
}

runEmulator().catch(console.error);
