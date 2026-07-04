import { useEffect, useRef } from 'react';
import maplibregl, { Map, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useDashboardStore } from '../../store/dashboardStore';

export const LiveMap = () => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<Map | null>(null);
  const markersRef = useRef<Record<number, Marker>>({});
  
  const { mapViewport, liveVehicles, setSelectedTripId } = useDashboardStore();

  // Initialize Map
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://tiles.openfreemap.org/styles/liberty', // OpenFreeMap Vector Tiles
      center: [mapViewport.longitude, mapViewport.latitude],
      zoom: mapViewport.zoom,
      attributionControl: false,
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    return () => {
      map.current?.remove();
      map.current = null;
    };
  }, []);

  // Update Viewport from Store
  useEffect(() => {
    if (map.current) {
      map.current.flyTo({
        center: [mapViewport.longitude, mapViewport.latitude],
        zoom: mapViewport.zoom,
        essential: true,
      });
    }
  }, [mapViewport]);

  // Sync Markers with Store
  useEffect(() => {
    if (!map.current) return;

    const currentVehicles = Object.values(liveVehicles);

    // Update or Create Markers
    currentVehicles.forEach((vehicle) => {
      let marker = markersRef.current[vehicle.tripId];
      
      if (!marker) {
        // Create custom DOM element for the marker
        const el = document.createElement('div');
        el.className = `w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-colors ${
          vehicle.status === 'ONLINE' ? 'bg-emerald-500' : 
          vehicle.status === 'STALE' ? 'bg-amber-500' : 'bg-red-500'
        }`;
        
        // Add a small arrow to indicate heading
        const arrow = document.createElement('div');
        arrow.className = 'w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-b-[6px] border-b-white';
        arrow.style.transform = `rotate(${vehicle.heading}deg)`;
        el.appendChild(arrow);

        // Click handler to select trip
        el.addEventListener('click', () => {
          setSelectedTripId(vehicle.tripId);
        });

        marker = new maplibregl.Marker({ element: el })
          .setLngLat([vehicle.lng, vehicle.lat])
          .addTo(map.current!);
          
        markersRef.current[vehicle.tripId] = marker;
      } else {
        // Update existing marker position & rotation
        marker.setLngLat([vehicle.lng, vehicle.lat]);
        const el = marker.getElement();
        
        // Update color class based on status
        el.className = `w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center cursor-pointer transition-colors ${
          vehicle.status === 'ONLINE' ? 'bg-emerald-500' : 
          vehicle.status === 'STALE' ? 'bg-amber-500' : 'bg-red-500'
        }`;
        
        // Update heading arrow
        const arrow = el.children[0] as HTMLElement;
        if (arrow) {
          arrow.style.transform = `rotate(${vehicle.heading}deg)`;
        }
      }
    });

    // We could clean up old markers here if needed

  }, [liveVehicles, setSelectedTripId]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};
