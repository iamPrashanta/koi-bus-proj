import { Server, Socket } from 'socket.io';
import { redisClient } from '../../config/redis';

export function initializeSockets(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join commuter rooms
    socket.on('join_route', (routeId: string) => {
      socket.join(`route:${routeId}`);
      console.log(`Socket ${socket.id} joined route:${routeId}`);
    });

    socket.on('join_operator', (operatorId: string) => {
      socket.join(`operator:${operatorId}`);
      console.log(`Socket ${socket.id} joined operator:${operatorId}`);
    });

    socket.on('join_trip', (tripId: string) => {
      socket.join(`trip:${tripId}`);
      console.log(`Socket ${socket.id} joined trip:${tripId}`);
    });

    // Leave rooms
    socket.on('leave_route', (routeId: string) => {
      socket.leave(`route:${routeId}`);
    });

    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

// Helper to broadcast to a specific room from HTTP controllers if needed
export function broadcastToRoom(io: Server, room: string, event: string, payload: any) {
  io.to(room).emit(event, payload);
}
