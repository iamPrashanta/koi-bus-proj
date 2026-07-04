import React from 'react';
import {
  Bus as BusIcon,
  User,
  Radio,
  Clock,
  Compass,
  Gauge,
  Activity,
  History,
  X,
  Play,
  Maximize2,
  AlertOctagon,
  Battery,
  HardDrive,
} from 'lucide-react';
import { Bus, Driver, Route, Device } from '../types';

interface TripDrawerProps {
  busId: string | null;
  onClose: () => void;
  buses: Bus[];
  drivers: Driver[];
  routes: Route[];
  devices: Device[];
  onCenterMap: (lat: number, lng: number) => void;
  onSetTab: (tab: string) => void;
}

export default function TripDrawer({
  busId,
  onClose,
  buses,
  drivers,
  routes,
  devices,
  onCenterMap,
  onSetTab,
}: TripDrawerProps) {
  if (!busId) return null;

  const bus = buses.find((b) => b.id === busId);
  if (!bus) return null;

  const driver = drivers.find((d) => d.id === bus.driverId);
  const route = routes.find((r) => r.id === bus.routeId);
  const device = devices.find((d) => d.id === bus.deviceId);

  const handleCenter = () => {
    if (bus.telemetryHistory.length > 0) {
      const latest = bus.telemetryHistory[bus.telemetryHistory.length - 1];
      onCenterMap(latest.lat, latest.lng);
    }
  };

  const handleReplayClick = () => {
    onSetTab('replay');
  };

  // Recent speed records for mini graph
  const recentSpeeds = bus.telemetryHistory.map((t) => t.speed);
  const maxSpeed = Math.max(...recentSpeeds, 60);

  // Assignment history mock values
  const assignmentHistory = [
    { time: '18:00', event: 'Driver Check-in', desc: `Assigned to ${driver?.name || 'Backup'}` },
    { time: '18:05', event: 'Route Commenced', desc: `${route?.name || 'Express'}` },
    { time: '22:14', event: 'Battery Charge Sync', desc: 'Plugged at terminal depot' },
  ];

  return (
    <div className="fixed top-16 right-0 bottom-0 w-96 glass-panel border-l border-white/10 shadow-2xl z-40 flex flex-col h-[calc(100vh-4rem)] animate-slide-in">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/60">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
            <BusIcon className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-display font-semibold text-white tracking-wide">
              {bus.licensePlate}
            </h2>
            <p className="text-[10px] font-mono text-gray-400">ID: {bus.id}</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-white rounded-lg hover:bg-white/5 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Quick Action Button Bar */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCenter}
            className="flex items-center justify-center space-x-1.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Center on Map</span>
          </button>
          <button
            onClick={handleReplayClick}
            className="flex items-center justify-center space-x-1.5 py-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg text-xs font-semibold tracking-wide border border-white/10 transition"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400" />
            <span>Telemetry Replay</span>
          </button>
        </div>

        {/* Primary Route Info Panel */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/30">Active assignment</p>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-400">Route Code:</span>
            <span className="text-xs font-semibold text-white font-mono">{route?.code || 'None'}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-400">Service Line:</span>
            <span className="text-xs font-semibold text-white">{route?.name || 'Unassigned'}</span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-400">Terminals:</span>
            <span className="text-[11px] text-gray-300">
              {route?.origin} ➔ {route?.destination}
            </span>
          </div>
          <div className="flex justify-between items-baseline">
            <span className="text-xs text-gray-400">Next stop target:</span>
            <span className="text-xs font-bold text-blue-400">{bus.nextStop}</span>
          </div>
        </div>

        {/* Live Driver Panel */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/30 mb-2">Driver on duty</p>
          {driver ? (
            <div className="flex items-center space-x-3">
              <img
                src={driver.avatar}
                alt={driver.name}
                className="w-10 h-10 rounded-full object-cover border border-white/15"
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-bold text-white leading-none">{driver.name}</h3>
                <p className="text-[10px] text-gray-400 mt-1">Shift Start: {driver.currentShiftStarted.substring(11, 16)} UTC</p>
                <div className="flex items-center space-x-1.5 mt-1.5">
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold border border-blue-500/20">
                    ★ {driver.rating} Rating
                  </span>
                  {driver.fatigueScore > 70 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-bold border border-red-500/20 animate-pulse">
                      Fatigue Warning
                    </span>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-amber-400">No driver assigned to this shift.</p>
          )}
        </div>

        {/* Telemetry Diagnostics Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Speed Card */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-gray-500 text-[10px] mb-1 font-mono uppercase tracking-wider">
              <span>Velocity</span>
              <Gauge className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-display font-bold text-white">{bus.speed}</span>
              <span className="text-[9px] text-gray-500">MPH</span>
            </div>
          </div>

          {/* Heading Card */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-gray-500 text-[10px] mb-1 font-mono uppercase tracking-wider">
              <span>Heading</span>
              <Compass className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-display font-bold text-white">{bus.heading}°</span>
              <span className="text-[9px] text-gray-500">N-NE</span>
            </div>
          </div>

          {/* Battery Level */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-gray-500 text-[10px] mb-1 font-mono uppercase tracking-wider">
              <span>Charge</span>
              <Battery className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-display font-bold text-white">{bus.batteryLevel}%</span>
              <span className="text-[9px] text-gray-500">Li-ion</span>
            </div>
          </div>

          {/* Delay Margin */}
          <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
            <div className="flex items-center justify-between text-gray-500 text-[10px] mb-1 font-mono uppercase tracking-wider">
              <span>Schedule Delay</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span
                className={`text-lg font-display font-bold ${
                  bus.scheduleDelay > 5 ? 'text-red-400' : bus.scheduleDelay > 0 ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {bus.scheduleDelay > 0 ? `+${bus.scheduleDelay}` : bus.scheduleDelay}
              </span>
              <span className="text-[9px] text-gray-500">Mins</span>
            </div>
          </div>
        </div>

        {/* Telemetry Unit */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/30">GPS Transponder Unit</p>
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                device?.status === 'healthy' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Model Name:</span>
            <span className="font-medium text-white">{device?.name || 'Onboard Gateway'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">Transponder IP:</span>
            <span className="font-mono text-gray-300 text-[11px]">{device?.ip || '10.240.xx.xx'}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-500">GPS Strength:</span>
            <span className="text-emerald-400 font-semibold">{device?.gpsSignal || 'STRONG'}</span>
          </div>
        </div>

        {/* Recent Telemetry Sparkline Charts */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="flex items-center justify-between mb-2">
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/30">Velocity timeline (mph)</p>
            <Activity className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          </div>
          <div className="h-16 w-full flex items-end">
            <svg className="w-full h-full overflow-visible" viewBox="0 0 100 30" preserveAspectRatio="none">
              <defs>
                <linearGradient id="drawerSpeedGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0" />
                </linearGradient>
              </defs>
              <path
                d={`M 0 ${30 - (recentSpeeds[0] / maxSpeed) * 25} L 25 ${30 - (recentSpeeds[1] / maxSpeed) * 25} L 50 ${30 - (recentSpeeds[2] / maxSpeed) * 25} L 75 ${30 - (recentSpeeds[3] / maxSpeed) * 25} L 100 ${30 - (recentSpeeds[4] / maxSpeed) * 25} L 100 30 L 0 30 Z`}
                fill="url(#drawerSpeedGradient)"
              />
              <path
                d={`M 0 ${30 - (recentSpeeds[0] / maxSpeed) * 25} L 25 ${30 - (recentSpeeds[1] / maxSpeed) * 25} L 50 ${30 - (recentSpeeds[2] / maxSpeed) * 25} L 75 ${30 - (recentSpeeds[3] / maxSpeed) * 25} L 100 ${30 - (recentSpeeds[4] / maxSpeed) * 25}`}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              {/* Dots representing speeds */}
              {recentSpeeds.map((speed, idx) => {
                const cx = idx * 25;
                const cy = 30 - (speed / maxSpeed) * 25;
                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r="2"
                    fill="#ffffff"
                    stroke="#3b82f6"
                    strokeWidth="1"
                  />
                );
              })}
            </svg>
          </div>
          <div className="flex justify-between text-[9px] font-mono text-gray-500 mt-1">
            <span>-20m</span>
            <span>-10m</span>
            <span>Current ({bus.speed} mph)</span>
          </div>
        </div>

        {/* Assignment History Logging */}
        <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl space-y-2">
          <div className="flex items-center space-x-1.5 mb-1">
            <History className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            <p className="text-[10px] font-mono font-bold uppercase tracking-wider text-white/30">Shift history log</p>
          </div>
          <div className="space-y-3 font-sans">
            {assignmentHistory.map((item, idx) => (
              <div key={idx} className="flex items-start text-xs relative pl-3 border-l border-white/10 last:border-l-0">
                <span className="absolute -left-1 top-1 w-2 h-2 rounded-full bg-blue-500" />
                <div className="flex-1 min-w-0 pl-1">
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-gray-200">{item.event}</span>
                    <span className="text-[10px] font-mono text-gray-500">{item.time}</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
