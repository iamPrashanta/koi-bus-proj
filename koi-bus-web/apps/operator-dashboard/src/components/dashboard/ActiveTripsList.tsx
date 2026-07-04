import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { useDashboardStore } from '../../store/dashboardStore';
import { Badge } from '../ui/badge';
import { useEffect } from 'react';

const fetchActiveTrips = async () => {
  const res = await fetch('http://localhost:3000/api/operators/1/live-map');
  if (!res.ok) throw new Error('Failed to fetch live map data');
  return res.json();
};

export const ActiveTripsList = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['active-trips'],
    queryFn: fetchActiveTrips,
    refetchInterval: 30000,
  });

  const { liveVehicles, setLiveVehicles, selectedTripId, setSelectedTripId } = useDashboardStore();

  // Populate initial store from query
  useEffect(() => {
    if (data?.data?.trips) {
      const vehicles: Record<number, any> = {};
      data.data.trips.forEach((t: any) => {
        // Only insert if not already present or if we want to overwrite
        if (!liveVehicles[t.tripId]) {
          vehicles[t.tripId] = t;
        }
      });
      if (Object.keys(vehicles).length > 0) {
        setLiveVehicles({ ...liveVehicles, ...vehicles });
      }
    }
  }, [data]);

  const vehiclesArray = Object.values(liveVehicles);

  return (
    <Card className="h-full flex flex-col shadow-lg">
      <CardHeader className="pb-3 border-b">
        <CardTitle className="text-lg">Active Trips ({vehiclesArray.length})</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-y-auto p-0">
        {isLoading && vehiclesArray.length === 0 ? (
          <div className="p-4 text-slate-500 text-sm">Loading trips...</div>
        ) : (
          <ul className="divide-y">
            {vehiclesArray.map((vehicle) => (
              <li 
                key={vehicle.tripId} 
                className={`p-4 cursor-pointer hover:bg-slate-50 transition-colors ${selectedTripId === vehicle.tripId ? 'bg-indigo-50 border-l-4 border-indigo-500' : ''}`}
                onClick={() => setSelectedTripId(vehicle.tripId)}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-900">Trip #{vehicle.tripId}</span>
                  <Badge variant={vehicle.status === 'ONLINE' ? 'default' : vehicle.status === 'STALE' ? 'secondary' : 'destructive'} 
                         className={vehicle.status === 'ONLINE' ? 'bg-emerald-500' : vehicle.status === 'STALE' ? 'bg-amber-500' : ''}>
                    {vehicle.status}
                  </Badge>
                </div>
                <div className="text-sm text-slate-500 flex justify-between">
                  <span>{vehicle.speed.toFixed(1)} km/h</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
};
