import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Bus, Users, Signal, Activity } from 'lucide-react';

const fetchDashboardStats = async () => {
  // Using Operator ID 1 for MVP
  const res = await fetch('http://localhost:3000/api/operators/1/dashboard');
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
};

export const StatsOverview = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: fetchDashboardStats,
    refetchInterval: 30000,
  });

  const stats = data?.data || { activeTrips: 0, activeDrivers: 0, activeBuses: 0, onlineDevices: 0 };

  return (
    <div className="grid grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Trips</CardTitle>
          <Activity className="h-4 w-4 text-indigo-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.activeTrips}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Drivers</CardTitle>
          <Users className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.activeDrivers}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Buses</CardTitle>
          <Bus className="h-4 w-4 text-amber-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.activeBuses}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Online Devices</CardTitle>
          <Signal className="h-4 w-4 text-emerald-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{isLoading ? '-' : stats.onlineDevices}</div>
        </CardContent>
      </Card>
    </div>
  );
};
