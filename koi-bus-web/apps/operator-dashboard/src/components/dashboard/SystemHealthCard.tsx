import { useQuery } from '@tanstack/react-query';
import { Badge } from '../ui/badge';
import { Card, CardContent } from '../ui/card';

const fetchHealth = async () => {
  const res = await fetch('http://localhost:3000/api/system/health');
  if (!res.ok) throw new Error('Failed to fetch health');
  return res.json();
};

export const SystemHealthCard = () => {
  const { data: health, isError } = useQuery({
    queryKey: ['system-health'],
    queryFn: fetchHealth,
    refetchInterval: 10000,
  });

  if (isError || !health) {
    return <Badge variant="destructive">System Offline</Badge>;
  }

  const getStatusColor = (status: string) => 
    status === 'healthy' ? 'bg-emerald-500' : 'bg-red-500';

  return (
    <div className="flex gap-4 items-center text-sm">
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getStatusColor(health.database?.status)}`} />
        <span className="text-slate-600">DB ({health.database?.latencyMs}ms)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getStatusColor(health.redis?.status)}`} />
        <span className="text-slate-600">Redis ({health.redis?.latencyMs}ms)</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={`w-2 h-2 rounded-full ${getStatusColor(health.websocket?.status)}`} />
        <span className="text-slate-600">WebSocket</span>
      </div>
    </div>
  );
};
