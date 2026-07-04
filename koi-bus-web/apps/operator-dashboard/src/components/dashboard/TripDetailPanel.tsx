import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useDashboardStore } from '../../store/dashboardStore';
import { X, User, Bus, Hash, Navigation } from 'lucide-react';
import { Badge } from '../ui/badge';

const fetchTripDetails = async (id: number) => {
  const res = await fetch(`http://localhost:3000/api/trips/${id}/details`);
  if (!res.ok) throw new Error('Failed to fetch trip details');
  return res.json();
};

export const TripDetailPanel = ({ tripId }: { tripId: number }) => {
  const { setSelectedTripId, liveVehicles, setMapViewport } = useDashboardStore();
  
  const { data, isLoading } = useQuery({
    queryKey: ['trip-details', tripId],
    queryFn: () => fetchTripDetails(tripId),
  });

  const liveData = liveVehicles[tripId];
  const details = data?.data;

  const handleZoomToBus = () => {
    if (liveData) {
      setMapViewport({ latitude: liveData.lat, longitude: liveData.lng, zoom: 16 });
    }
  };

  return (
    <Card className="h-full flex flex-col shadow-2xl border-l-4 border-l-indigo-500">
      <CardHeader className="pb-3 border-b flex flex-row items-center justify-between">
        <CardTitle className="text-lg flex items-center gap-2">
          Trip #{tripId}
          {liveData && (
            <Badge variant={liveData.status === 'ONLINE' ? 'default' : 'secondary'}
                   className={liveData.status === 'ONLINE' ? 'bg-emerald-500' : ''}>
              {liveData.status}
            </Badge>
          )}
        </CardTitle>
        <button onClick={() => setSelectedTripId(null)} className="p-1 hover:bg-slate-100 rounded-full">
          <X className="w-5 h-5 text-slate-500" />
        </button>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-6">
        {isLoading ? (
          <div className="text-sm text-slate-500">Loading details...</div>
        ) : !details ? (
          <div className="text-sm text-red-500">Failed to load trip details.</div>
        ) : (
          <>
            {/* Route Info */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Route</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                  {details.route?.code || 'NA'}
                </div>
                <div>
                  <div className="font-medium">{details.route?.name}</div>
                  <div className="text-xs text-slate-500">Status: {details.trip?.status}</div>
                </div>
              </div>
            </div>

            {/* Assignment */}
            <div>
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Assignment</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className={details.driver ? 'text-slate-900' : 'text-slate-400 italic'}>
                    {details.driver ? `${details.driver.user?.name || 'Driver'} (ID: ${details.driver.id})` : 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Bus className="w-4 h-4 text-slate-400" />
                  <span className={details.bus ? 'text-slate-900' : 'text-slate-400 italic'}>
                    {details.bus ? details.bus.registrationNumber : 'Unassigned'}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Hash className="w-4 h-4 text-slate-400" />
                  <span className={details.device ? 'text-slate-900 font-mono' : 'text-slate-400 italic'}>
                    {details.device ? details.device.serialNumber : 'Unassigned'}
                  </span>
                </div>
              </div>
            </div>

            {/* Telemetry Stats */}
            {liveData && (
              <div>
                <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Live Telemetry</h3>
                <div className="bg-slate-50 p-3 rounded-lg space-y-2 text-sm border">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Speed</span>
                    <span className="font-medium text-slate-900">{liveData.speed.toFixed(1)} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Heading</span>
                    <span className="font-medium text-slate-900">{liveData.heading.toFixed(0)}°</span>
                  </div>
                  <div className="flex justify-between pt-2 mt-2 border-t">
                    <span className="text-slate-500">Coords</span>
                    <span className="font-mono text-xs text-slate-700">{liveData.lat.toFixed(4)}, {liveData.lng.toFixed(4)}</span>
                  </div>
                </div>
                <button 
                  onClick={handleZoomToBus}
                  className="mt-3 w-full flex items-center justify-center gap-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm py-2 rounded-md transition-colors"
                >
                  <Navigation className="w-4 h-4" />
                  Zoom to Bus
                </button>
              </div>
            )}
            
            {/* Replay Controls Placeholder */}
            <div>
               <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Session Control</h3>
               <button className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm py-2 rounded-md transition-colors">
                  View Replay
               </button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
