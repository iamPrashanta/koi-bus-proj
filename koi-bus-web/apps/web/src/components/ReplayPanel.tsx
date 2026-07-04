import React, { useState, useEffect } from 'react';
import { Route } from '../types';
import {
  Play,
  Pause,
  FastForward,
  RotateCcw,
  Compass,
  Gauge,
  MapPin,
  Clock,
  CheckCircle,
} from 'lucide-react';

interface ReplayPanelProps {
  routes: Route[];
}

export default function ReplayPanel({ routes }: ReplayPanelProps) {
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);

  const route = routes.find((r) => r.id === selectedRouteId) || routes[0];

  // Simulating playback progression
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            setIsPlaying(false);
            return 100;
          }
          return Math.min(prev + 0.8 * speedMultiplier, 100);
        });
      }, 100);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, speedMultiplier]);

  const handlePlayPause = () => {
    if (progress >= 100) {
      setProgress(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setProgress(0);
  };

  // Projected SVG coordinates for the static trace
  const svgWidth = 600;
  const svgHeight = 220;

  // Render high fidelity mock points for tracing
  const points = [
    { x: 50, y: 150, stop: route?.stops[0]?.name || 'Origin' },
    { x: 180, y: 70, stop: route?.stops[1]?.name || 'Stop 2' },
    { x: 320, y: 180, stop: route?.stops[2]?.name || 'Stop 3' },
    { x: 450, y: 100, stop: route?.stops[3]?.name || 'Stop 4' },
    { x: 550, y: 50, stop: route?.stops[4]?.name || 'Destination' },
  ];

  // Calculate moving dot position based on progress (0 to 100)
  const getDotPosition = () => {
    const numSegments = points.length - 1;
    const totalSegmentProgress = 100 / numSegments;

    const currentSegment = Math.min(Math.floor(progress / totalSegmentProgress), numSegments - 1);
    const pSegment = (progress % totalSegmentProgress) / totalSegmentProgress;

    const start = points[currentSegment];
    const end = points[currentSegment + 1];

    if (!start || !end) return { x: 50, y: 150 };

    return {
      x: start.x + (end.x - start.x) * pSegment,
      y: start.y + (end.y - start.y) * pSegment,
    };
  };

  const dotPos = getDotPosition();

  // Draw smooth path
  const pathD = points.reduce((acc, pt, idx) => {
    return acc + `${idx === 0 ? 'M' : 'L'} ${pt.x} ${pt.y} `;
  }, '');

  // Calculate telemetry specs
  const activeTelemetry = {
    speed: isPlaying && progress < 100 ? Math.floor(25 + Math.sin(progress / 5) * 15) : 0,
    voltage: (380 - (progress * 0.4)).toFixed(1),
    timeStr: `23:${Math.min(Math.floor(progress / 1.7), 59).toString().padStart(2, '0')}:${Math.floor((progress * 60) % 60).toString().padStart(2, '0')}`,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Playback Controls and Telemetry Metrics */}
      <div className="lg:col-span-1 glass-panel rounded-2xl p-5 border border-white/5 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <div>
            <h2 className="text-sm font-display font-semibold text-white tracking-wide">Historical Teleplay</h2>
            <p className="text-xs text-gray-400">Replay, inspect, and audit previous route telemetries.</p>
          </div>

          {/* Route selector */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Select Line Track</label>
            <select
              value={selectedRouteId}
              onChange={(e) => {
                setSelectedRouteId(e.target.value);
                setProgress(0);
                setIsPlaying(false);
              }}
              className="w-full p-2.5 bg-[#0a0a0c] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
            >
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  Line {r.code} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Micro Telemetry display */}
          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-white/5">
            <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg">
              <span className="text-[9px] font-mono text-gray-500 block uppercase">REPLAY SPEED</span>
              <span className="text-sm font-display font-bold text-white flex items-center mt-0.5">
                <Gauge className="w-3.5 h-3.5 mr-1 text-blue-400" />
                {activeTelemetry.speed} MPH
              </span>
            </div>
            <div className="p-2 bg-white/[0.01] border border-white/5 rounded-lg">
              <span className="text-[9px] font-mono text-gray-500 block uppercase">BATTERY DISSIPATION</span>
              <span className="text-sm font-display font-bold text-white flex items-center mt-0.5">
                <Clock className="w-3.5 h-3.5 mr-1 text-purple-400" />
                {activeTelemetry.voltage}V
              </span>
            </div>
          </div>
        </div>

        {/* Buttons and scrub controls */}
        <div className="space-y-3.5 pt-4 border-t border-white/5">
          {/* Timeline scrub */}
          <div className="space-y-1">
            <div className="flex justify-between items-baseline font-mono text-[10px] text-gray-500">
              <span>TRIP START 23:00</span>
              <span className="text-blue-400 font-bold">{activeTelemetry.timeStr}</span>
              <span>DEPOT ARRIVE 23:59</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              step="0.1"
              value={progress}
              onChange={(e) => setProgress(parseFloat(e.target.value))}
              className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500 focus:outline-none"
            />
          </div>

          {/* Action row buttons */}
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={handleReset}
              className="p-2 bg-white/5 hover:bg-white/10 text-gray-300 rounded-lg border border-white/10 transition"
              title="Reset Playback"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              onClick={handlePlayPause}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg transition shadow-md flex items-center justify-center space-x-1.5"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>PAUSE INSPECTION</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>PLAY TELEMETRY</span>
                </>
              )}
            </button>

            {/* Speed selection */}
            <div className="flex items-center bg-white/5 border border-white/10 rounded-lg overflow-hidden">
              {[1, 5, 10].map((spd) => (
                <button
                  key={spd}
                  onClick={() => setSpeedMultiplier(spd)}
                  className={`px-2 py-1.5 text-[9px] font-mono font-bold border-r last:border-0 border-white/5 transition ${
                    speedMultiplier === spd ? 'bg-blue-600 text-white font-black' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {spd}x
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Path Animation Panel */}
      <div className="lg:col-span-2 glass-panel rounded-2xl p-5 border border-white/5 flex flex-col h-[350px] lg:h-auto overflow-hidden">
        <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
          <div className="flex items-center space-x-2">
            <Compass className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-white">Visual Track Trace</span>
          </div>

          <span className="text-[10px] font-mono text-gray-500 uppercase">
            GEOPATH RECONSTRUCTION CORE
          </span>
        </div>

        {/* SVG Replay Field */}
        <div className="flex-1 relative bg-black/40 border border-white/5 rounded-xl flex items-center justify-center overflow-hidden min-h-[220px]">
          <svg className="w-full h-full overflow-visible max-w-[580px]" viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
            {/* Draw Path */}
            <path
              d={pathD}
              fill="none"
              stroke="rgba(255, 255, 255, 0.05)"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d={pathD}
              fill="none"
              stroke={route?.color || '#3b82f6'}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="4,4"
              opacity="0.6"
            />

            {/* Draw Stops Node Circles */}
            {points.map((pt, sIdx) => {
              const isPassed = progress >= (sIdx / (points.length - 1)) * 100;
              return (
                <g key={sIdx} className="group/stop">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isPassed ? '5' : '4'}
                    fill={isPassed ? (route?.color || '#3b82f6') : '#0e0e11'}
                    stroke={route?.color || '#3b82f6'}
                    strokeWidth="1.5"
                    className="transition-all"
                  />
                  <text
                    x={pt.x}
                    y={pt.y + 16}
                    textAnchor="middle"
                    fill={isPassed ? '#fff' : 'rgba(255,255,255,0.4)'}
                    fontSize="8"
                    fontFamily="monospace"
                  >
                    {pt.stop.substring(0, 10)}
                  </text>
                </g>
              );
            })}

            {/* Glowing moving dot */}
            {progress > 0 && progress < 100 && (
              <g>
                <circle
                  cx={dotPos.x}
                  cy={dotPos.y}
                  r="12"
                  fill={route?.color || '#3b82f6'}
                  fillOpacity="0.25"
                  className="animate-ping"
                />
                <circle
                  cx={dotPos.x}
                  cy={dotPos.y}
                  r="6.5"
                  fill="#ffffff"
                  stroke={route?.color || '#3b82f6'}
                  strokeWidth="2.5"
                />
              </g>
            )}

            {/* Complete marker */}
            {progress >= 100 && (
              <g transform={`translate(${points[points.length - 1].x - 10}, ${points[points.length - 1].y - 28})`}>
                <rect width="20" height="12" rx="3" fill="#10b981" />
                <path d="M 5 6 L 9 9 L 15 3" fill="none" stroke="#fff" strokeWidth="1.5" />
              </g>
            )}
          </svg>
        </div>
      </div>
    </div>
  );
}
