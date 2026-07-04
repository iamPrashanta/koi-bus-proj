'use client';
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Bus, Route } from '../types';

interface InteractiveMapProps {
  buses: Bus[];
  routes: Route[];
  selectedBusId: string | null;
  onSelectBus: (busId: string | null) => void;
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string | null) => void;
}

// Fix Leaflet's default icon path issues in Next.js
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Create a custom bus icon
const busIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default function LeafletMap({
  buses,
  routes,
  selectedBusId,
  onSelectBus,
  selectedRouteId,
  onSelectRoute,
}: InteractiveMapProps) {
  // Center on West Bengal (Durgapur/Kolkata bounds)
  const center: [number, number] = [23.5, 87.5];
  const zoom = 9;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={center} 
        zoom={zoom} 
        style={{ width: '100%', height: '100%', minHeight: '500px', borderRadius: '0.5rem' }}
      >
        <TileLayer
          attribution='&copy; Offline Map Data'
          url="/api/maps/tiles/{z}/{x}/{y}.png"
        />

        {/* Draw Routes */}
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id;
          if (!isSelected && selectedRouteId) return null; // Hide others if one is selected

          // Assuming route.stops have lat/lng
          const positions: [number, number][] = route.stops.map(s => [
            s.lat || 23.5, 
            s.lng || 87.5
          ]);

          return (
            <Polyline
              key={route.id}
              positions={positions}
              color={isSelected ? '#3b82f6' : '#94a3b8'}
              weight={isSelected ? 5 : 3}
              opacity={isSelected ? 1 : 0.6}
              eventHandlers={{
                click: () => onSelectRoute(route.id)
              }}
            />
          );
        })}

        {/* Draw Buses */}
        {buses.map((bus) => {
          if (!bus.telemetryHistory || bus.telemetryHistory.length === 0) return null;
          const latest = bus.telemetryHistory[bus.telemetryHistory.length - 1];
          const isSelected = selectedBusId === bus.id;

          return (
            <Marker
              key={bus.id}
              position={[latest.lat, latest.lng]}
              icon={busIcon}
              eventHandlers={{
                click: () => onSelectBus(bus.id)
              }}
            >
              <Popup>
                <div className="font-semibold text-gray-900">{bus.licensePlate}</div>
                <div className="text-sm text-gray-500">Speed: {latest.speed || bus.speed} km/h</div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
