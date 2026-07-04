import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useDashboardStore } from '../store/dashboardStore';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3000';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const { updateLiveVehicle } = useDashboardStore();

  useEffect(() => {
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket'],
    });

    socketRef.current.on('connect', () => {
      console.log('Connected to websocket server');
      // In a real app, you might join specific rooms here or authenticate
    });

    socketRef.current.on('location:update', (payload) => {
      if (payload.version === 1) {
        updateLiveVehicle(payload.tripId, {
          tripId: payload.tripId,
          lat: payload.lat,
          lng: payload.lng,
          speed: payload.speed,
          heading: payload.heading,
          status: 'ONLINE' // Always mark online upon receiving a direct socket ping
        });
      }
    });

    socketRef.current.on('trip:started', (payload) => {
      console.log('Trip started:', payload);
    });

    socketRef.current.on('trip:paused', (payload) => {
      console.log('Trip paused:', payload);
    });

    socketRef.current.on('trip:resumed', (payload) => {
      console.log('Trip resumed:', payload);
    });

    socketRef.current.on('trip:ended', (payload) => {
      console.log('Trip ended:', payload);
      // Optional: remove from liveVehicles or mark offline
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [updateLiveVehicle]);

  return socketRef.current;
};
