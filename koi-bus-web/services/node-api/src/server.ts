import http from 'http';
import app from './app';
import { env } from './config/env';
import { Server } from 'socket.io';
import { initializeSockets } from './modules/telemetry/socket.handler';

const port = env.PORT || 4000;

const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Attach socket logic
initializeSockets(io);

// Make `io` accessible via Express request object if needed inside controllers
app.set('io', io);

server.on('error', (err: NodeJS.ErrnoException) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n❌ FATAL: Port ${port} is already in use!`);
    console.error(`   Another process (likely Next.js) is occupying this port.`);
    console.error(`   → Ensure Next.js runs on port 3001 (NEXT_DEV_PORT=3001 or next dev -p 3001)`);
    console.error(`   → Ensure the Node API .env has PORT=3000\n`);
    process.exit(1);
  }
  throw err;
});

server.listen(port, () => {
  console.log(`\n🚀 Koi Bus API Server Started`);
  console.log(`   API URL:      http://localhost:${port}/api`);
  console.log(`   Environment:  ${env.NODE_ENV || 'development'}`);
  console.log(`   Database:     PostgreSQL (OK)`);
  console.log(`   Redis:        ${env.REDIS_URL}`);
  console.log(`   WebSocket:    Enabled (Socket.IO)`);
  console.log(``);
});
