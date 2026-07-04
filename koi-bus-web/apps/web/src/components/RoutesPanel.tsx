import React, { useState } from 'react';
import { Route, Bus } from '../types';
import { MapPin, Bus as BusIcon, TrendingUp, Compass, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

interface RoutesPanelProps {
  routes: Route[];
  buses: Bus[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null) => void;
}

export default function RoutesPanel({
  routes,
  buses,
  selectedRouteId,
  onSelectRoute,
}: RoutesPanelProps) {
  const [activeTab, setActiveTab] = useState<string>(selectedRouteId || routes[0]?.id);

  const selectedRoute = routes.find((r) => r.id === activeTab) || routes[0];
  const activeBusesForRoute = buses.filter((b) => b.routeId === selectedRoute.id);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Route List Selection Panel */}
      <div className="lg:col-span-1 glass-panel rounded-2xl p-4 border border-white/5 space-y-3 flex flex-col h-[550px]">
        <div>
          <h2 className="text-sm font-display font-semibold text-white tracking-wide">Route Coverage Lines</h2>
          <p className="text-[11px] text-gray-400">Select an active line to inspect transit stops coverage.</p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {routes.map((route) => {
            const isSelected = activeTab === route.id;
            const routeBuses = buses.filter((b) => b.routeId === route.id && b.status === 'online');

            return (
              <button
                key={route.id}
                onClick={() => {
                  setActiveTab(route.id);
                  onSelectRoute(route.id);
                }}
                className={`w-full p-3.5 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                  isSelected
                    ? 'bg-white/[0.03] border-white/15 shadow-lg'
                    : 'bg-transparent border-white/5 hover:bg-white/[0.01] hover:border-white/10'
                }`}
              >
                {/* Visual Accent Colored Strip */}
                <div
                  className="absolute left-0 top-0 bottom-0 w-1"
                  style={{ backgroundColor: route.color }}
                />

                <div className="space-y-1 pl-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold text-white shadow"
                      style={{ backgroundColor: `${route.color}30`, border: `1px solid ${route.color}50` }}
                    >
                      Line {route.code}
                    </span>
                    <span className="text-xs font-bold text-gray-200 group-hover:text-white transition">
                      {route.name}
                    </span>
                  </div>
                  <p className="text-[10px] text-gray-400 truncate max-w-[180px]">
                    {route.origin} ➔ {route.destination}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold text-white block">
                    {routeBuses.length} Buses
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold font-mono">
                    {route.scheduleAdherence}% Adh
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        <div className="pt-3 border-t border-white/5 text-center text-[10px] text-gray-500 font-mono">
          TOTAL ENROUTE MILEAGE: <span className="text-blue-400">142 MI/H</span>
        </div>
      </div>

      {/* Selected Route Detail Panel */}
      {selectedRoute && (
        <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/5 flex flex-col h-[550px] overflow-y-auto space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-4 gap-3">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                style={{ backgroundColor: `${selectedRoute.color}20`, border: `1px solid ${selectedRoute.color}40` }}
              >
                <Compass className="w-5 h-5" style={{ color: selectedRoute.color }} />
              </div>
              <div>
                <h2 className="text-base font-display font-bold text-white flex items-center">
                  {selectedRoute.name}
                  <span className="ml-2 text-xs font-mono text-gray-400 font-normal">[{selectedRoute.id}]</span>
                </h2>
                <p className="text-xs text-gray-400">
                  Terminals: {selectedRoute.origin} to {selectedRoute.destination}
                </p>
              </div>
            </div>

            <button
              onClick={() => onSelectRoute(selectedRoute.id)}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide transition shadow-lg self-start"
            >
              Trace on Dispatch Map
            </button>
          </div>

          {/* Core Analytics Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[9px] font-mono text-gray-500 uppercase block">Compliance score</span>
              <span className="text-lg font-display font-bold text-emerald-400">{selectedRoute.scheduleAdherence}%</span>
            </div>
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[9px] font-mono text-gray-500 uppercase block">Active Stops count</span>
              <span className="text-lg font-display font-bold text-white">{selectedRoute.stops.length} Stops</span>
            </div>
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[9px] font-mono text-gray-500 uppercase block">Vehicles Enroute</span>
              <span className="text-lg font-display font-bold text-blue-400">{activeBusesForRoute.length} Units</span>
            </div>
            <div className="p-3 bg-white/[0.01] border border-white/5 rounded-xl">
              <span className="text-[9px] font-mono text-gray-500 uppercase block">Average Interval</span>
              <span className="text-lg font-display font-bold text-purple-400">12 Mins</span>
            </div>
          </div>

          {/* Stops Timeline and Passenger Loads */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Stops Checklist */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">Scheduled Transit Stops</h3>
              </div>

              <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                {selectedRoute.stops.map((stop, sIdx) => {
                  const isTerminus = sIdx === 0 || sIdx === selectedRoute.stops.length - 1;
                  return (
                    <div key={stop.name} className="flex items-center pl-7 relative">
                      {/* Stop Node Pin */}
                      <span
                        className={`absolute left-1.5 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full border bg-[#0e0e11] flex items-center justify-center transition-all ${
                          isTerminus ? 'border-amber-400 scale-110 shadow' : 'border-blue-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isTerminus ? 'bg-amber-400' : 'bg-blue-400'}`} />
                      </span>

                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-200 block truncate leading-none">
                          {stop.name}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono">
                          LAT: {stop.lat.toFixed(4)} | LNG: {stop.lng.toFixed(4)}
                        </span>
                      </div>

                      {isTerminus && (
                        <span className="text-[9px] px-1 bg-amber-400/10 text-amber-400 font-mono border border-amber-400/20 rounded uppercase">
                          Terminus
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Active Vehicles Loads list */}
            <div className="space-y-3">
              <div className="flex items-center space-x-1.5">
                <BusIcon className="w-4 h-4 text-gray-400 shrink-0" />
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">Live Vehicles Enroute</h3>
              </div>

              <div className="space-y-2.5">
                {activeBusesForRoute.length === 0 ? (
                  <p className="text-xs text-gray-500 p-4 bg-white/[0.01] rounded-lg border border-white/5 text-center">
                    No active buses currently tracking on this line.
                  </p>
                ) : (
                  activeBusesForRoute.map((bus) => {
                    const pct = (bus.passengerCount / bus.maxCapacity) * 100;
                    return (
                      <div
                        key={bus.id}
                        className="p-3 bg-white/[0.01] hover:bg-white/[0.02] border border-white/5 rounded-lg transition"
                      >
                        <div className="flex justify-between items-baseline mb-1.5">
                          <span className="font-mono text-xs font-bold text-white">{bus.licensePlate}</span>
                          <span className="text-[10px] text-gray-400">Next stop: {bus.nextStop}</span>
                        </div>

                        {/* Progress load bar */}
                        <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden mb-1">
                          <div
                            className={`h-full rounded-full ${
                              pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>

                        <div className="flex justify-between text-[9px] font-mono text-gray-500">
                          <span>LOAD: {bus.passengerCount} / {bus.maxCapacity} Passengers</span>
                          <span>VEL: {bus.speed} MPH</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
