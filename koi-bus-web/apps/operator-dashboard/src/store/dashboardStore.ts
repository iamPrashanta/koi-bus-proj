import { create } from 'zustand';

export interface LiveVehicle {
  tripId: number;
  lat: number;
  lng: number;
  speed: number;
  heading: number;
  status: 'ONLINE' | 'STALE' | 'OFFLINE';
}

interface DashboardStore {
  selectedTripId: number | null;
  setSelectedTripId: (id: number | null) => void;
  
  mapViewport: { latitude: number; longitude: number; zoom: number };
  setMapViewport: (viewport: Partial<{ latitude: number; longitude: number; zoom: number }>) => void;
  
  filterStatus: 'ALL' | 'ONLINE' | 'STALE' | 'OFFLINE';
  setFilterStatus: (status: 'ALL' | 'ONLINE' | 'STALE' | 'OFFLINE') => void;

  liveVehicles: Record<number, LiveVehicle>;
  updateLiveVehicle: (tripId: number, vehicle: Partial<LiveVehicle>) => void;
  setLiveVehicles: (vehicles: Record<number, LiveVehicle>) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  selectedTripId: null,
  setSelectedTripId: (id) => set({ selectedTripId: id }),

  mapViewport: { latitude: 22.5726, longitude: 88.3639, zoom: 12 }, // Kolkata default
  setMapViewport: (viewport) => set((state) => ({ mapViewport: { ...state.mapViewport, ...viewport } })),

  filterStatus: 'ALL',
  setFilterStatus: (status) => set({ filterStatus: status }),

  liveVehicles: {},
  updateLiveVehicle: (tripId, vehicle) => set((state) => ({
    liveVehicles: {
      ...state.liveVehicles,
      [tripId]: {
        ...(state.liveVehicles[tripId] || { tripId, lat: 0, lng: 0, speed: 0, heading: 0, status: 'ONLINE' }),
        ...vehicle
      }
    }
  })),
  setLiveVehicles: (vehicles) => set({ liveVehicles: vehicles })
}));
