"use client";
import React, { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Metrics from '@/components/Metrics';
import InteractiveMap from '@/components/InteractiveMap';
import TripDrawer from '@/components/TripDrawer';
import FleetTable from '@/components/FleetTable';
import ReplayPanel from '@/components/ReplayPanel';
import { Compass, X, LayoutDashboard, Bus as BusIcon, RotateCcw } from 'lucide-react';
import { useAuth } from '@/stores/useAuth';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { socket } from '@/lib/socket';

export default function AdminPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  const handleLogout = async () => {
    try { await api.post('/auth/logout'); } catch {}
    logout();
    window.location.href = '/login';
  };

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toUTCString().replace('GMT', 'UTC').replace(/^[A-Za-z]+, /, ''));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Connect Socket.IO
  useEffect(() => {
    socket.connect();
    return () => {
      socket.disconnect();
    };
  }, []);

  // Fetch Bootstrap Data
  const { data: bootstrapData } = useQuery({
    queryKey: ['dashboard', 'bootstrap'],
    queryFn: async () => {
      const res = await api.get('/dashboard/bootstrap');
      return res.data;
    },
    refetchInterval: 10000,
  });

  const operatorId = bootstrapData?.operator?.id || 1;

  // Fetch System Health
  const { data: healthData } = useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      const res = await api.get('/system/health');
      return res.data;
    },
    refetchInterval: 15000,
  });

  // Fetch Live Map Data (trips)
  const { data: liveMapData, refetch: refetchLiveMap } = useQuery({
    queryKey: ['operators', operatorId, 'live-map'],
    queryFn: async () => {
      const res = await api.get(`/operators/${operatorId}/live-map`);
      return res.data;
    },
    refetchInterval: 3000,
  });

  // Fetch Fleet (active buses)
  const { data: fleetData, refetch: refetchFleet } = useQuery({
    queryKey: ['trips', 'buses', 'active'],
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
    socket.on('trip:started', onTripUpdate);
    socket.on('trip:ended', onTripUpdate);
    socket.on('location:update', refetchLiveMap);

    return () => {
      socket.off('trip:started', onTripUpdate);
      socket.off('trip:ended', onTripUpdate);
      socket.off('location:update', refetchLiveMap);
    };
  }, [refetchLiveMap, refetchFleet]);

  const activeTripsCount = bootstrapData?.stats?.activeTrips || 0;
  const activeDriversCount = bootstrapData?.stats?.activeDrivers || 0;
  const activeBusesCount = bootstrapData?.stats?.activeBuses || 0;
  const onlineDevicesCount = healthData?.redis?.status === 'healthy' ? activeBusesCount : 0;
  
  const liveTrips = liveMapData?.data?.trips || [];
  const activeBuses = fleetData?.data || [];
  
  const totalSpeed = liveTrips.reduce((acc: number, curr: any) => acc + (curr.speed || 0), 0);
  const avgSpeedVal = liveTrips.length > 0 ? Math.round(totalSpeed / liveTrips.length) : 0;

  const mappedBuses = activeBuses.map((bus: any) => {
    const liveTrip = liveTrips.find((t: any) => t.tripId === bus.trip?.id);
    return {
      ...bus,
      status: liveTrip?.status || 'OFFLINE',
      speed: liveTrip?.speed || 0,
      heading: liveTrip?.heading || 0,
      routeId: liveTrip?.routeId || bus.trip?.routeId || '',
      telemetryHistory: liveTrip ? [{
        lat: liveTrip.lat,
        lng: liveTrip.lng,
        speed: liveTrip.speed,
      }] : [],
    };
  });

  const globalStats = {
    activeTrips: activeTripsCount,
    activeDrivers: activeDriversCount,
    activeBuses: activeBusesCount,
    onlineDevices: onlineDevicesCount,
    avgSpeed: avgSpeedVal,
    activeAlerts: 0,
  };

  const mobileNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet Grid', icon: BusIcon },
    { id: 'replay', label: 'Route Replay', icon: RotateCcw },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-[#030303] text-gray-100 font-sans antialiased selection:bg-blue-600 selection:text-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} incidentsCount={0} />

      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <div className="md:hidden flex items-center justify-between h-16 px-4 bg-black/80 border-b border-white/5 sticky top-0 z-40 backdrop-blur-md shrink-0">
            <button onClick={() => setIsMobileMenuOpen(true)} className="flex items-center space-x-3 focus:outline-none cursor-pointer group">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 shadow-md shrink-0 group-hover:scale-105 transition-transform">
                <Compass className="w-6 h-6 text-white animate-spin-slow" />
              </div>
              <div className="text-left">
                <h1 className="text-sm font-display font-bold tracking-wider text-white group-hover:text-blue-400 transition-colors">KOI BUS</h1>
              </div>
            </button>
        </div>

        {activeTab === 'dashboard' && (
          <header className="hidden md:flex h-16 shrink-0 border-b border-white/5 bg-black/40 backdrop-blur-md px-6 items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-3.5">
              <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-md glow-indicator-active">LIVE NETWORK</span>
              <div className="h-4 w-[1px] bg-white/10" />
              <span className="text-xs font-mono text-gray-400">{bootstrapData?.operator?.name || 'Loading...'}</span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1.5 font-mono text-xs text-gray-400 bg-white/[0.02] border border-white/5 px-3 py-1 rounded-md">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                <span>{currentTime}</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-bold text-white leading-none">{user?.firstName} {user?.lastName}</p>
                  <p className="text-[10px] text-gray-500 font-mono">ROLE: {user?.role}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="ml-4 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-md text-xs font-bold tracking-wider uppercase transition-colors"
                >
                  Log out
                </button>
              </div>
            </div>
          </header>
        )}

        <main className="flex-1 p-6 space-y-6">
          {activeTab === 'dashboard' && <Metrics stats={globalStats} />}

          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col xl:flex-row gap-6">
                <InteractiveMap 
                  buses={mappedBuses}
                  routes={[]}
                  selectedBusId={selectedBusId} 
                  onSelectBus={setSelectedBusId} 
                  selectedRouteId={selectedRouteId} 
                  onSelectRoute={setSelectedRouteId} 
                />
                
                {/* Health & Activities Disabled Placeholder */}
                <div className="flex flex-col bg-zinc-900 border border-zinc-800 rounded-lg p-4 w-full xl:w-96">
                  <h3 className="text-lg font-bold text-white mb-4">System Health</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Database</span>
                      <span className={healthData?.database?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}>{healthData?.database?.status || 'Loading'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">Redis Cache</span>
                      <span className={healthData?.redis?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}>{healthData?.redis?.status || 'Loading'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-zinc-400">WebSocket</span>
                      <span className={healthData?.websocket?.status === 'healthy' ? 'text-emerald-400' : 'text-red-400'}>{healthData?.websocket?.status || 'Loading'}</span>
                    </div>
                  </div>

                  <div className="mt-8 border-t border-zinc-800 pt-4 flex flex-col items-center justify-center flex-1">
                     <p className="text-zinc-500 text-sm font-mono tracking-widest uppercase">Incidents Disabled</p>
                     <p className="text-zinc-600 text-xs mt-2">Coming in Phase 6</p>
                  </div>
                </div>
              </div>

              <FleetTable 
                buses={mappedBuses} 
                onSelectBus={setSelectedBusId} 
              />
            </div>
          )}

          {activeTab === 'fleet' && (
            <div className="space-y-6 animate-fade-in">
              <FleetTable 
                buses={mappedBuses} 
                onSelectBus={(id) => { setSelectedBusId(id); setActiveTab('dashboard'); }} 
              />
            </div>
          )}

          {activeTab === 'replay' && (
            <div className="animate-fade-in">
              <ReplayPanel routes={[]} />
            </div>
          )}


        </main>
      </div>

      <TripDrawer busId={selectedBusId} onClose={() => setSelectedBusId(null)} buses={mappedBuses} drivers={[]} routes={[]} devices={[]} onCenterMap={() => {}} onSetTab={(tab) => { setActiveTab(tab); setSelectedBusId(null); }} />

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-[#030303]/98 backdrop-blur-lg flex flex-col p-6 animate-fade-in md:hidden">
          {/* Mobile menu implementation omitted for brevity, logic follows desktop */}
        </div>
      )}
    </div>
  );
}
