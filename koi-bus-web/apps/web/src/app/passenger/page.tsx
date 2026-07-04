"use client";

import {
  MapPin,
  Bus,
  Clock,
  Route,
  History,
  AlertTriangle,
  ChevronRight,
  Navigation,
  Compass,
} from "lucide-react";

/**
 * Koi Bus Passenger Portal — clean dashboard.
 * Cards: My Routes, Live Buses, Nearby Stops, Upcoming Arrivals, Journey History, Report Issue
 */

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
  color: string;
  bgGlow: string;
  comingSoon?: boolean;
}

const cards: DashboardCard[] = [
  {
    id: "my-routes",
    title: "My Routes",
    description: "View saved routes and frequent trips",
    icon: Route,
    color: "text-blue-400",
    bgGlow: "from-blue-600/20 to-blue-600/0",
    comingSoon: true,
  },
  {
    id: "live-buses",
    title: "Live Buses",
    description: "Track buses in real time on the map",
    icon: Bus,
    color: "text-emerald-400",
    bgGlow: "from-emerald-600/20 to-emerald-600/0",
  },
  {
    id: "nearby-stops",
    title: "Nearby Stops",
    description: "Find bus stops closest to your location",
    icon: Navigation,
    color: "text-purple-400",
    bgGlow: "from-purple-600/20 to-purple-600/0",
    comingSoon: true,
  },
  {
    id: "upcoming-arrivals",
    title: "Upcoming Arrivals",
    description: "See scheduled arrivals at your stops",
    icon: Clock,
    color: "text-amber-400",
    bgGlow: "from-amber-600/20 to-amber-600/0",
    comingSoon: true,
  },
  {
    id: "journey-history",
    title: "Journey History",
    description: "Review past trips and travel patterns",
    icon: History,
    color: "text-cyan-400",
    bgGlow: "from-cyan-600/20 to-cyan-600/0",
    comingSoon: true,
  },
  {
    id: "report-issue",
    title: "Report Issue",
    description: "Report delays, safety concerns, or lost items",
    icon: AlertTriangle,
    color: "text-red-400",
    bgGlow: "from-red-600/20 to-red-600/0",
    comingSoon: true,
  },
];

export default function PassengerPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border border-zinc-800 p-8">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 rounded-full bg-emerald-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-tr from-blue-600 to-emerald-500 shadow-lg shrink-0">
            <Compass className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold text-white tracking-tight">
              Welcome to Koi Bus
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Track your buses, routes and arrivals in real time.
            </p>
          </div>
        </div>
      </div>

      {/* Dashboard cards grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = card.icon;
          const isComingSoon = card.comingSoon;
          const Wrapper = isComingSoon ? 'div' : 'a';
          const href = isComingSoon ? undefined : `/passenger/${card.id}`;

          return (
            // @ts-ignore
            <Wrapper
              href={href}
              key={card.id}
              className={`group relative overflow-hidden rounded-xl bg-zinc-900 border border-zinc-800 p-6 text-left transition-all duration-200 block ${
                isComingSoon 
                  ? 'opacity-60 cursor-not-allowed' 
                  : 'hover:border-zinc-700 hover:bg-zinc-800/60 cursor-pointer'
              }`}
            >
              {/* Background glow */}
              {!isComingSoon && (
                <div
                  className={`absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-gradient-radial ${card.bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl pointer-events-none`}
                />
              )}

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-lg bg-white/5 ${card.color}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  {isComingSoon ? (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded bg-zinc-800 text-zinc-400 border border-zinc-700">
                      Soon
                    </span>
                  ) : (
                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                  )}
                </div>

                <h3 className="text-sm font-semibold text-white mb-1">
                  {card.title}
                </h3>
                <p className="text-xs text-zinc-500 leading-relaxed">
                  {card.description}
                </p>
              </div>
            </Wrapper>
          );
        })}
      </div>

      {/* Quick info footer */}
      <div className="flex items-center justify-center gap-4 text-[10px] font-mono text-zinc-600 py-4">
        <div className="flex items-center gap-1.5">
          <MapPin className="w-3 h-3" />
          <span>West Bengal Transport Network</span>
        </div>
        <span className="text-zinc-800">•</span>
        <span>Koi Bus v2.0</span>
      </div>
    </div>
  );
}
