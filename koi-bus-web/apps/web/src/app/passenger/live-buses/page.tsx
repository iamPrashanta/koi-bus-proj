"use client";
import React, { useState, useEffect } from 'react';
import InteractiveMap from '@/components/InteractiveMap';
import { useAuth } from '@/stores/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function PassengerLiveBusesPage() {
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Live Map Data
  const { data: liveMapData, refetch: refetchLiveMap } = useQuery({
    queryKey: ['passenger', 'live-map'],
    queryFn: async () => {
      // Operator ID 1 is the default for our seed data
      const res = await api.get(`/operators/1/live-map`);
      return res.data;
    },
    refetchInterval: 3000,
  });

  // Fetch Fleet (active buses)
  const { data: fleetData, refetch: refetchFleet } = useQuery({
    queryKey: ['passenger', 'buses', 'active'],
    queryFn: async () => {
      const res = await api.get('/trips/buses/active');
      return res.data;
    },
    refetchInterval: 5000,
  });

  // Listen to socket events for immediate refetch
  useEffect(() => {
    const onTripUpdate = () => {
      refetchLiveMap();
      refetchFleet();
    };
    socket.on('location:update', refetchLiveMap);
    socket.on('trip:started', onTripUpdate);
    socket.on('trip:ended', onTripUpdate);

    return () => {
      socket.off('location:update', refetchLiveMap);
      socket.off('trip:started', onTripUpdate);
      socket.off('trip:ended', onTripUpdate);
    };
  }, [refetchLiveMap, refetchFleet]);

  const activeBuses = fleetData?.data || [];
  const liveTrips = liveMapData?.data?.trips || {};

  const mappedBuses = activeBuses.map((bus: any) => {
    const live = liveTrips[bus.id];
    return {
      id: bus.id,
      name: bus.bus?.registrationNumber || 'Unknown Bus',
      licensePlate: bus.bus?.registrationNumber || 'Unknown Bus',
      status: bus.status,
      speed: live?.speed ? parseFloat(live.speed) : 0,
      heading: live?.heading ? parseFloat(live.heading) : 0,
      updatedAt: live?.updated_at || bus.updatedAt,
      telemetryHistory: live?.lat && live?.lng ? [{
        lat: parseFloat(live.lat),
        lng: parseFloat(live.lng),
        speed: live.speed ? parseFloat(live.speed) : 0,
      }] : [],
      route: {
        id: bus.routeId,
        name: bus.route?.name || 'Unknown Route',
        color: bus.route?.color || '#3b82f6',
      },
      driver: {
        id: bus.driverId,
        name: bus.driver ? `${bus.driver.user?.firstName || ''} ${bus.driver.user?.lastName || ''}`.trim() : 'Unknown',
        phone: bus.driver?.user?.phone,
      }
    };
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 h-[calc(100vh-120px)] flex flex-col">
      <div className="flex items-center gap-4">
        <Link href="/passenger" className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Live Buses</h1>
          <p className="text-xs text-zinc-400">Track all active trips in real time.</p>
        </div>
      </div>

      <div className="flex-1 min-h-[500px] border border-zinc-800 rounded-xl overflow-hidden relative">
        <InteractiveMap 
          buses={mappedBuses}
          routes={[]}
          selectedBusId={selectedBusId} 
          onSelectBus={setSelectedBusId} 
          selectedRouteId={null} 
          onSelectRoute={() => {}} 
        />
      </div>
    </div>
  );
}
