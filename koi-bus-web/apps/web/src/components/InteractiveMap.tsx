'use client';
import dynamic from 'next/dynamic';
import React from 'react';
import { Bus, Route } from '../types';

interface InteractiveMapProps {
  buses: Bus[];
  routes: Route[];
  selectedBusId: string | null;
  onSelectBus: (busId: string | null) => void;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null) => void;
}

const DynamicLeafletMap = dynamic(() => import('./LeafletMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[500px] flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-gray-500 font-medium">Loading Interactive Map...</div>
    </div>
  ),
});

export default function InteractiveMap(props: InteractiveMapProps) {
  return <DynamicLeafletMap {...props} />;
}
