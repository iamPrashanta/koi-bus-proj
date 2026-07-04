import React, { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  Navigation,
  Search,
  Radio,
  Layers,
  MapPin,
  AlertOctagon,
  Users,
} from 'lucide-react';
import { Bus, Route, BusStatus, RouteStop } from '../types';
export const MAP_BOUNDS = {
  minLat: 37.73,
  maxLat: 37.81,
  minLng: -122.48,
  maxLng: -122.38,
};

interface InteractiveMapProps {
  buses: Bus[];
  routes: Route[];
  selectedBusId: string | null;
  onSelectBus: (busId: string | null) => void;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null) => void;
}

export default function InteractiveMap({
  buses,
  routes,
  selectedBusId,
  onSelectBus,
  selectedRouteId,
  onSelectRoute,
}: InteractiveMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<number>(1.2);
  const [pan, setPan] = useState({ x: -40, y: -20 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showStops, setShowStops] = useState<boolean>(true);
  const [showGrid, setShowGrid] = useState<boolean>(true);

  // SVG dimensions for coordinates
  const width = 800;
  const height = 550;

  // Projection helper: maps geo coordinates to SVG space with zoom & pan
  const project = (lat: number, lng: number) => {
    const latSpan = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
    const lngSpan = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;

    // Normalizing coordinates between 0 and 1
    const xNorm = (lng - MAP_BOUNDS.minLng) / lngSpan;
    // Latitude decreases as Y goes down in SVG space
    const yNorm = 1 - (lat - MAP_BOUNDS.minLat) / latSpan;

    // Apply zoom & pan transformations
    const x = xNorm * width * zoom + pan.x;
    const y = yNorm * height * zoom + pan.y;

    return { x, y };
  };

  // Center on a specific lat/lng
  const centerOn = (lat: number, lng: number) => {
    const latSpan = MAP_BOUNDS.maxLat - MAP_BOUNDS.minLat;
    const lngSpan = MAP_BOUNDS.maxLng - MAP_BOUNDS.minLng;

    const xNorm = (lng - MAP_BOUNDS.minLng) / lngSpan;
    const yNorm = 1 - (lat - MAP_BOUNDS.minLat) / latSpan;

    const currentZoom = 1.6;
    setZoom(currentZoom);
    setPan({
      x: width / 2 - xNorm * width * currentZoom,
      y: height / 2 - yNorm * height * currentZoom,
    });
  };

  // Drag handlers for panning
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with left click
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let newZoom = zoom;
    if (e.deltaY < 0) {
      newZoom = Math.min(zoom * zoomFactor, 4);
    } else {
      newZoom = Math.max(zoom / zoomFactor, 0.7);
    }
    setZoom(newZoom);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    // Search for matching bus ID or license plate
    const matchedBus = buses.find(
      (b) =>
        b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (matchedBus && matchedBus.telemetryHistory.length > 0) {
      const latest = matchedBus.telemetryHistory[matchedBus.telemetryHistory.length - 1];
      centerOn(latest.lat, latest.lng);
      onSelectBus(matchedBus.id);
      return;
    }

    // Try finding stops instead
    for (const route of routes) {
      const matchedStop = route.stops.find((s) =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      if (matchedStop) {
        centerOn(matchedStop.lat, matchedStop.lng);
        onSelectRoute(route.id);
        break;
      }
    }
  };

  const handleResetView = () => {
    setZoom(1.2);
    setPan({ x: -40, y: -20 });
    onSelectBus(null);
    onSelectRoute(null);
  };

  // Find currently selected bus object
  const activeBus = buses.find((b) => b.id === selectedBusId);

  return (
    <div className="relative flex-1 flex flex-col glass-panel rounded-2xl overflow-hidden border border-white/5 h-[580px]">
      {/* Search and Control Overlay */}
      <div className="absolute top-4 left-4 right-4 z-10 flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="flex items-center bg-black/80 backdrop-blur-md rounded-lg border border-white/10 px-3 py-1.5 w-72 pointer-events-auto shadow-lg"
        >
          <Search className="w-4 h-4 text-gray-400 mr-2 shrink-0" />
          <input
            type="text"
            placeholder="Search license, stops, routes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-[10px] text-gray-500 hover:text-white"
            >
              Clear
            </button>
          )}
        </form>

        {/* Diagnostic Layer Selection */}
        <div className="flex items-center space-x-2 pointer-events-auto bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 shadow-lg text-[11px] font-mono">
          <button
            onClick={() => setShowStops(!showStops)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition ${
              showStops ? 'text-blue-400 bg-blue-500/10' : 'text-gray-500 hover:text-white'
            }`}
          >
            <MapPin className="w-3 h-3" />
            <span>STOPS</span>
          </button>
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`flex items-center space-x-1 px-2 py-0.5 rounded transition ${
              showGrid ? 'text-indigo-400 bg-indigo-500/10' : 'text-gray-500 hover:text-white'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>GRID</span>
          </button>
        </div>
      </div>

      {/* Hero Visual Map Box */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        className={`flex-1 relative overflow-hidden bg-[#050508] select-none ${
          isDragging ? 'cursor-grabbing' : 'cursor-grab'
        }`}
      >
        {/* Vector Background Canvas Grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {showGrid && (
            <>
              {/* Radial Coordinate Circles */}
              <circle cx="50%" cy="50%" r="150" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <circle cx="50%" cy="50%" r="300" fill="none" stroke="rgba(255,255,255,0.015)" strokeWidth="1" />
              {/* Radar Grid Lines */}
              <line x1="0" y1="50%" x2="100%" y2="50%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              <line x1="50%" y1="0" x2="50%" y2="100%" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
              {/* Coordinates Indicator */}
              <text x="10" y="540" fill="rgba(255,255,255,0.2)" fontSize="9" fontFamily="monospace">
                REF: WGS84 | SF METRO GRID | MERCATOR PROJECTION
              </text>
            </>
          )}
        </svg>

        {/* Dynamic Vector/Route Drawer Container */}
        <div className="absolute inset-0 w-full h-full">
          <svg className="w-full h-full">
            {/* 1. DRAW ROUTE PATH LINES */}
            {routes.map((route) => {
              const isSelected = selectedRouteId === route.id || (activeBus && activeBus.routeId === route.id);
              // Draw polyline connecting stops
              const pathPoints = route.stops
                .map((stop) => {
                  const projected = project(stop.lat, stop.lng);
                  return `${projected.x},${projected.y}`;
                })
                .join(' ');

              return (
                <g key={route.id} id={`route-g-${route.id}`}>
                  {/* Glowing background shadow trail */}
                  <polyline
                    points={pathPoints}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isSelected ? '6' : '3'}
                    strokeOpacity={isSelected ? '0.4' : '0.12'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                  />
                  {/* Solid Sharp Inner Core */}
                  <polyline
                    points={pathPoints}
                    fill="none"
                    stroke={route.color}
                    strokeWidth={isSelected ? '2.5' : '1.5'}
                    strokeOpacity={isSelected ? '0.9' : '0.5'}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-300"
                    strokeDasharray={isSelected ? 'none' : '4,4'}
                  />
                </g>
              );
            })}

            {/* 2. DRAW ALL ROUTE STOPS IF TOGGLED */}
            {showStops &&
              routes.map((route) => {
                const isRouteSelected =
                  selectedRouteId === route.id || (activeBus && activeBus.routeId === route.id);
                return (
                  <g key={`stops-${route.id}`} id={`stops-g-${route.id}`}>
                    {route.stops.map((stop, stopIdx) => {
                      const proj = project(stop.lat, stop.lng);
                      return (
                        <g
                          key={`${route.id}-stop-${stopIdx}`}
                          className="group/stop cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRoute(route.id);
                            centerOn(stop.lat, stop.lng);
                          }}
                        >
                          {/* Inner dot */}
                          <circle
                            cx={proj.x}
                            cy={proj.y}
                            r={isRouteSelected ? '4.5' : '3'}
                            fill="#000"
                            stroke={route.color}
                            strokeWidth="2"
                            className="transition-all duration-300"
                          />
                          {/* Hover Ripple */}
                          <circle
                            cx={proj.x}
                            cy={proj.y}
                            r="10"
                            fill={route.color}
                            fillOpacity="0"
                            className="group-hover/stop:fill-opacity-15 transition-all"
                          />
                          {/* Label tooltip */}
                          <text
                            x={proj.x + 8}
                            y={proj.y + 4}
                            fill="rgba(255,255,255,0.7)"
                            fontSize="8"
                            fontFamily="sans-serif"
                            className="opacity-0 group-hover/stop:opacity-100 transition-opacity bg-black pointer-events-none"
                          >
                            {stop.name} ({route.code})
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

            {/* 3. DRAW DYNAMIC LIVE VEHICLES */}
            {buses.map((bus) => {
              if (bus.telemetryHistory.length === 0) return null;
              const latest = bus.telemetryHistory[bus.telemetryHistory.length - 1];
              const proj = project(latest.lat, latest.lng);
              const isSelected = selectedBusId === bus.id;

              // Color based on vehicle status
              let statusColor = '#ef4444'; // Red offline
              if (bus.status === BusStatus.ONLINE) statusColor = '#22c55e'; // Green online
              if (bus.status === BusStatus.STALE) statusColor = '#eab308'; // Orange stale

              return (
                <g
                  key={bus.id}
                  id={`bus-marker-${bus.id}`}
                  className="cursor-pointer group/bus"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectBus(isSelected ? null : bus.id);
                  }}
                >
                  {/* Radar ping rings for active vehicles */}
                  {bus.status === BusStatus.ONLINE && (
                    <circle
                      cx={proj.x}
                      cy={proj.y}
                      r="16"
                      fill="none"
                      stroke={statusColor}
                      strokeWidth="1.5"
                      className="radar-ring origin-center"
                      style={{ transformOrigin: `${proj.x}px ${proj.y}px` }}
                    />
                  )}

                  {/* High Tech Glowing Hover/Selected Ring */}
                  <circle
                    cx={proj.x}
                    cy={proj.y}
                    r={isSelected ? '14' : '11'}
                    fill="rgba(0,0,0,0.6)"
                    stroke={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.15)'}
                    strokeWidth="1.5"
                    className="transition-all duration-300"
                  />

                  {/* Inner Status Core */}
                  <circle
                    cx={proj.x}
                    cy={proj.y}
                    r="5.5"
                    fill={statusColor}
                    className="transition-all duration-300"
                  />

                  {/* Vector Direction Pointer */}
                  <g
                    style={{
                      transform: `rotate(${bus.heading}deg)`,
                      transformOrigin: `${proj.x}px ${proj.y}px`,
                    }}
                    className="transition-transform duration-1000"
                  >
                    <polygon
                      points={`${proj.x},${proj.y - 12} ${proj.x - 4},${proj.y - 8} ${proj.x + 4},${proj.y - 8}`}
                      fill={statusColor}
                      opacity={isSelected ? '1' : '0.8'}
                    />
                  </g>

                  {/* Compact High-Tech ID Tag */}
                  <text
                    x={proj.x}
                    y={proj.y + 22}
                    textAnchor="middle"
                    fill={isSelected ? '#3b82f6' : 'rgba(255,255,255,0.8)'}
                    fontSize="9"
                    fontWeight={isSelected ? 'bold' : 'normal'}
                    fontFamily="monospace"
                    className="bg-black/90 px-1 rounded transition-colors"
                  >
                    {bus.licensePlate.substring(0, 6)}
                  </text>
                </g>
              );
            })}
          </svg>

          {/* Floating Detail Popup Card for Selected Bus */}
          {activeBus && (
            <div
              className="absolute pointer-events-auto bg-black/90 backdrop-blur-md rounded-xl border border-white/10 p-3.5 w-60 text-xs shadow-2xl transition-all duration-300 select-text"
              style={{
                left: `${Math.min(
                  Math.max(project(activeBus.telemetryHistory[activeBus.telemetryHistory.length - 1].lat, activeBus.telemetryHistory[activeBus.telemetryHistory.length - 1].lng).x - 120, 10),
                  width - 250
                )}px`,
                top: `${Math.min(
                  Math.max(project(activeBus.telemetryHistory[activeBus.telemetryHistory.length - 1].lat, activeBus.telemetryHistory[activeBus.telemetryHistory.length - 1].lng).y - 145, 10),
                  height - 180
                )}px`,
              }}
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-2">
                <div className="flex items-center space-x-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      activeBus.status === BusStatus.ONLINE
                        ? 'bg-emerald-500 glow-indicator-active'
                        : activeBus.status === BusStatus.STALE
                        ? 'bg-amber-400'
                        : 'bg-red-500'
                    }`}
                  />
                  <span className="font-mono font-bold text-white text-[11px]">{activeBus.licensePlate}</span>
                </div>
                <button
                  onClick={() => onSelectBus(null)}
                  className="text-gray-400 hover:text-white font-bold text-[10px]"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-1 font-sans text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-500">Route Code:</span>
                  <span className="font-bold text-white">{activeBus.routeId.replace('R-', '')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Speed / Heading:</span>
                  <span className="text-white">
                    {activeBus.speed} MPH / {activeBus.heading}°
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Telemetry unit:</span>
                  <span className="font-mono text-blue-400">{activeBus.deviceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Load / capacity:</span>
                  <span
                    className={`font-semibold ${
                      activeBus.passengerCount > activeBus.maxCapacity * 0.8 ? 'text-rose-400' : 'text-emerald-400'
                    }`}
                  >
                    {activeBus.passengerCount}/{activeBus.maxCapacity} passengers
                  </span>
                </div>
                {activeBus.scheduleDelay > 0 ? (
                  <div className="flex justify-between text-rose-400 font-mono text-[10px] mt-1.5 bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    <span className="flex items-center"><AlertOctagon className="w-2.5 h-2.5 mr-1" /> DELAYED:</span>
                    <span>+{activeBus.scheduleDelay} mins</span>
                  </div>
                ) : (
                  <div className="flex justify-between text-emerald-400 font-mono text-[10px] mt-1.5 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    <span>STATUS:</span>
                    <span>ON SCHEDULE</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Zoom Panning Control Widgets */}
        <div className="absolute bottom-4 right-4 z-10 flex flex-col space-y-1 pointer-events-auto bg-black/80 border border-white/10 p-1 rounded-lg backdrop-blur-md shadow-lg">
          <button
            onClick={() => setZoom(Math.min(zoom * 1.2, 4.0))}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setZoom(Math.max(zoom / 1.2, 0.6))}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded transition border-t border-white/5"
            title="Reset Grid Center"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Selected Route / Filter Details Widget */}
        {(selectedRouteId || selectedBusId) && (
          <div className="absolute bottom-4 left-4 z-10 bg-black/80 border border-white/10 px-3 py-2 rounded-lg backdrop-blur-md text-[10px] font-mono text-gray-400 flex items-center space-x-2 shadow-lg">
            <Radio className="w-3.5 h-3.5 text-blue-500 animate-pulse shrink-0" />
            <div>
              FILTERED BY:{' '}
              <span className="text-white font-bold">
                {selectedBusId ? `VEHICLE ${activeBus?.licensePlate}` : `ROUTE ${selectedRouteId}`}
              </span>
            </div>
            <button
              onClick={handleResetView}
              className="ml-2 pl-2 border-l border-white/10 text-rose-400 hover:text-rose-300 uppercase tracking-widest font-bold"
            >
              Clear
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
