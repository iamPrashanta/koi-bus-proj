'use client';

import { useDashboardStore } from '../store/dashboardStore';
import { useSocket } from '../hooks/useSocket';
import { LiveMap } from '../components/map/LiveMap';
import { StatsOverview } from '../components/dashboard/StatsOverview';
import { SystemHealthCard } from '../components/dashboard/SystemHealthCard';
import { ActiveTripsList } from '../components/dashboard/ActiveTripsList';
import { TripDetailPanel } from '../components/dashboard/TripDetailPanel';

export default function Dashboard() {
  // Initialize socket connection
  useSocket();
  const selectedTripId = useDashboardStore(state => state.selectedTripId);

  return (
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden text-slate-900">
      {/* Sidebar for Navigation / Context (Optional) */}
      <div className="w-16 bg-slate-900 flex-shrink-0 flex flex-col items-center py-4">
        <div className="w-10 h-10 bg-indigo-500 rounded-lg shadow-md mb-8 flex items-center justify-center text-white font-bold">
          KB
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <header className="h-16 bg-white border-b px-6 flex items-center justify-between z-10 shadow-sm">
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">Operator Dashboard</h1>
          <SystemHealthCard />
        </header>

        <div className="flex-1 flex relative">
          {/* Map Layer */}
          <div className="absolute inset-0">
            <LiveMap />
          </div>
          
          {/* Overlay UI - Stats */}
          <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none">
            <StatsOverview />
          </div>

          {/* Overlay UI - Active Trips Sidebar */}
          <div className="absolute top-32 left-4 bottom-4 w-80 z-10 pointer-events-auto">
            <ActiveTripsList />
          </div>

          {/* Overlay UI - Selected Trip Detail Panel */}
          {selectedTripId && (
            <div className="absolute top-32 right-4 bottom-4 w-96 z-10 pointer-events-auto">
              <TripDetailPanel tripId={selectedTripId} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
