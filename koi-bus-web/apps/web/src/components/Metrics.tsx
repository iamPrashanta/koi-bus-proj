import React from 'react';
import { TrendingUp, TrendingDown, ShieldAlert, Wifi, Zap, UserCheck, Play, Navigation } from 'lucide-react';

interface MetricsProps {
  stats: {
    activeTrips: number;
    activeDrivers: number;
    activeBuses: number;
    onlineDevices: number;
    avgSpeed: number;
    activeAlerts: number;
  };
}

export default function Metrics({ stats }: MetricsProps) {
  // Let's draw some gorgeous custom static SVG paths for our high-end sparklines
  const sparklines = {
    trips: 'M 0 15 Q 10 5, 20 12 T 40 8 T 60 18 T 80 4 T 100 10',
    drivers: 'M 0 18 Q 15 15, 30 5 T 60 12 T 90 2 T 120 8',
    buses: 'M 0 12 Q 10 18, 25 8 T 50 15 T 75 5 T 100 12',
    devices: 'M 0 10 Q 15 8, 35 18 T 70 4 T 105 10 T 140 12',
    speed: 'M 0 15 Q 10 12, 20 18 T 45 8 T 70 14 T 100 5',
    alerts: 'M 0 5 Q 10 18, 25 5 T 50 16 T 75 4 T 100 18',
  };

  const cards = [
    {
      id: 'trips',
      title: 'Active Trips',
      value: stats.activeTrips,
      trend: '+4.8%',
      isPositive: true,
      sparkline: sparklines.trips,
      strokeColor: '#3b82f6', // blue
      icon: Play,
    },
    {
      id: 'drivers',
      title: 'Active Drivers',
      value: stats.activeDrivers,
      trend: '88% duty',
      isPositive: true,
      sparkline: sparklines.drivers,
      strokeColor: '#10b981', // green
      icon: UserCheck,
    },
    {
      id: 'buses',
      title: 'Active Buses',
      value: stats.activeBuses,
      trend: '6 Running, 1 Idle',
      isPositive: true,
      sparkline: sparklines.buses,
      strokeColor: '#8b5cf6', // purple
      icon: Navigation,
    },
    {
      id: 'devices',
      title: 'Online Devices',
      value: stats.onlineDevices,
      trend: '92% signal',
      isPositive: true,
      sparkline: sparklines.devices,
      strokeColor: '#06b6d4', // cyan
      icon: Wifi,
    },
    {
      id: 'speed',
      title: 'Avg Speed',
      value: `${stats.avgSpeed} MPH`,
      trend: '-1.4%',
      isPositive: false,
      sparkline: sparklines.speed,
      strokeColor: '#f59e0b', // amber
      icon: Zap,
    },
    {
      id: 'alerts',
      title: 'Critical Alerts',
      value: stats.activeAlerts,
      trend: stats.activeAlerts > 0 ? 'Needs Attention' : 'All Clear',
      isPositive: stats.activeAlerts === 0,
      sparkline: sparklines.alerts,
      strokeColor: stats.activeAlerts > 0 ? '#ef4444' : '#10b981', // red or green
      icon: ShieldAlert,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            id={`metric-card-${card.id}`}
            className="glass-panel glass-panel-hover p-4 rounded-xl flex flex-col justify-between relative overflow-hidden"
          >
            {/* Background Accent Glow */}
            <div
              className="absolute -right-6 -bottom-6 w-20 h-20 rounded-full opacity-5 pointer-events-none filter blur-xl"
              style={{ backgroundColor: card.strokeColor }}
            />

            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-sans text-gray-400 font-medium tracking-wide uppercase">
                {card.title}
              </span>
              <div
                className="p-1.5 rounded-md"
                style={{ backgroundColor: `${card.strokeColor}10`, color: card.strokeColor }}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>

            <div className="flex items-baseline space-x-2 mt-1">
              <span className="text-xl font-display font-bold text-white tracking-tight">
                {card.value}
              </span>
              <span
                className={`text-[10px] font-mono font-medium flex items-center ${
                  card.isPositive ? 'text-emerald-400' : 'text-amber-400'
                }`}
              >
                {card.isPositive ? (
                  <TrendingUp className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                ) : (
                  <TrendingDown className="w-2.5 h-2.5 mr-0.5 shrink-0" />
                )}
                {card.trend}
              </span>
            </div>

            {/* Sparkline Graphic */}
            <div className="mt-3 h-8 w-full flex items-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
                <defs>
                  <linearGradient id={`gradient-${card.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={card.strokeColor} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={card.strokeColor} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                {/* Filled Area */}
                <path
                  d={`${card.sparkline} L 100 20 L 0 20 Z`}
                  fill={`url(#gradient-${card.id})`}
                  stroke="none"
                />
                {/* Glow Stroke */}
                <path
                  d={card.sparkline}
                  fill="none"
                  stroke={card.strokeColor}
                  strokeWidth="2"
                  strokeLinecap="round"
                  className="stroke-pulse"
                />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
