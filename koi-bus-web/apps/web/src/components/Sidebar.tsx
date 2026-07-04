import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  Bus,
  MapPin,
  Users,
  Cpu,
  AlertTriangle,
  RotateCcw,
  Compass,
  Wifi,
  Database,
  Layers,
  Activity,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  incidentsCount: number;
}

export default function Sidebar({ activeTab, setActiveTab, incidentsCount }: SidebarProps) {
  // Let's create live-looking mock latencies for system status
  const [latencies, setLatencies] = useState({
    postgis: 14,
    redis: 2,
    socket: 8,
    api: 24,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setLatencies({
        postgis: Math.floor(12 + Math.random() * 5),
        redis: Math.floor(1 + Math.random() * 3),
        socket: Math.floor(5 + Math.random() * 6),
        api: Math.floor(18 + Math.random() * 10),
      });
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet Grid', icon: Bus },
    { id: 'routes', label: 'Route Coverage', icon: MapPin },
    { id: 'drivers', label: 'Drivers Shift', icon: Users },
    { id: 'devices', label: 'Telemetry Devices', icon: Cpu },
    {
      id: 'incidents',
      label: 'Incident Control',
      icon: AlertTriangle,
      badge: incidentsCount > 0 ? incidentsCount : undefined,
    },
    { id: 'replay', label: 'Route Replay', icon: RotateCcw },
  ];

  return (
    <aside className="hidden md:flex md:w-68 shrink-0 glass-panel border-r border-white/5 flex-col h-full overflow-y-auto transition-all duration-300">
      {/* Brand Header */}
      <div className="p-4 md:p-6 border-b border-white/5 flex items-center justify-center md:justify-start space-x-0 md:space-x-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-emerald-500 shadow-md shrink-0">
          <Compass className="w-6 h-6 text-white animate-spin-slow" />
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-[#0a0a0c] glow-indicator-active" />
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-display font-bold tracking-wider text-white">KOI BUS</h1>
          <p className="text-[10px] font-mono uppercase tracking-widest text-emerald-500/80">Operator Dashboard</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-2 md:px-4 py-6 space-y-1.5">
        <p className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-white/30 hidden md:block">Operations</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-${item.id}`}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-center md:justify-between px-2 md:px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/15 to-indigo-600/5 text-blue-400 border-l-2 border-blue-500 font-medium'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.03]'
              }`}
            >
              <div className="flex items-center space-x-0 md:space-x-3">
                <Icon
                  className={`w-4 h-5 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-blue-400' : 'text-gray-500 group-hover:text-gray-300'
                  }`}
                />
                <span className="font-sans text-xs tracking-wide hidden md:inline">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/30 rounded-full animate-pulse hidden md:inline">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Live Systems Telemetry Panel */}
      <div className="p-4 border-t border-white/5 bg-black/40 hidden md:block">
        <div className="flex items-center justify-between mb-3">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/40">Core Subsystems</p>
          <div className="flex items-center space-x-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-indicator-active" />
            <span className="text-[9px] font-mono text-emerald-500 uppercase tracking-widest">Normal</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          {/* PostGIS */}
          <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span>PostGIS</span>
              <Layers className="w-3 h-3 text-blue-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-emerald-400 font-bold">ONLINE</span>
              <span className="text-[9px] text-white/30">{latencies.postgis}ms</span>
            </div>
          </div>

          {/* Redis */}
          <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span>Redis</span>
              <Database className="w-3 h-3 text-red-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-emerald-400 font-bold">CACHED</span>
              <span className="text-[9px] text-white/30">{latencies.redis}ms</span>
            </div>
          </div>

          {/* Socket */}
          <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span>Socket</span>
              <Wifi className="w-3 h-3 text-purple-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-emerald-400 font-bold">LIVE</span>
              <span className="text-[9px] text-white/30">{latencies.socket}ms</span>
            </div>
          </div>

          {/* API Gateway */}
          <div className="p-2 rounded bg-white/[0.02] border border-white/5 flex flex-col justify-between">
            <div className="flex items-center justify-between text-white/50 mb-1">
              <span>Gateway</span>
              <Activity className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-emerald-400 font-bold">SECURE</span>
              <span className="text-[9px] text-white/30">{latencies.api}ms</span>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/30 font-mono tracking-wider">
            GPS REFRESH RATE: <span className="text-blue-400">1000ms</span>
          </p>
        </div>
      </div>
    </aside>
  );
}
