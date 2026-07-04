export enum BusStatus {
  ONLINE = 'online',
  STALE = 'stale',
  OFFLINE = 'offline',
}

export enum DriverStatus {
  ONLINE = 'online',
  BREAK = 'break',
  OFFLINE = 'offline',
}

export enum IncidentPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum IncidentStatus {
  OPEN = 'open',
  DISPATCHED = 'dispatched',
  RESOLVED = 'resolved',
}

export interface Telemetry {
  time: string;
  lat: number;
  lng: number;
  speed: number;
  passengerCount: number;
  batteryLevel: number;
  temp: number;
}

export interface Bus {
  id: string;
  licensePlate: string;
  driverId: string;
  routeId: string;
  status: BusStatus;
  speed: number;
  heading: number;
  passengerCount: number;
  maxCapacity: number;
  batteryLevel: number;
  nextStop: string;
  scheduleDelay: number; // in minutes (negative is early, positive is delayed)
  lastUpdate: string;
  deviceId: string;
  telemetryHistory: Telemetry[];
}

export interface Driver {
  id: string;
  name: string;
  avatar: string;
  status: DriverStatus;
  phone: string;
  rating: number;
  totalHours: number;
  currentShiftStarted: string;
  fatigueScore: number; // 0-100
}

export interface RouteStop {
  name: string;
  lat: number;
  lng: number;
}

export interface Route {
  id: string;
  name: string;
  code: string;
  origin: string;
  destination: string;
  stops: RouteStop[];
  activeBuses: number;
  scheduleAdherence: number; // percentage (e.g. 94)
  color: string;
}

export interface Device {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'error';
  ip: string;
  firmwareVersion: string;
  memoryUsed: number; // percentage
  cpuTemp: number; // °C
  gpsSignal: 'strong' | 'weak' | 'none';
  lastPing: string;
  busId?: string;
}

export interface Incident {
  id: string;
  timestamp: string;
  title: string;
  routeId?: string;
  busId?: string;
  priority: IncidentPriority;
  status: IncidentStatus;
  description: string;
  reporter: string;
}

export interface Activity {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}
