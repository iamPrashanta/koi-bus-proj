import React, { useState, useEffect } from 'react';
import { Bus, Route, Incident, IncidentPriority, IncidentStatus } from '../types';
import InteractiveMap from './InteractiveMap';
import {
  Compass,
  MapPin,
  Clock,
  Bus as BusIcon,
  Users,
  Send,
  AlertTriangle,
  Heart,
  Smile,
  ShieldCheck,
  Search,
  CheckCircle2,
  Info,
  ChevronRight,
  Filter,
  Eye,
  Sun,
  Moon,
} from 'lucide-react';

interface PassengerPortalProps {
  buses: Bus[];
  routes: Route[];
  onReportIncident: (newInc: Omit<Incident, 'id' | 'timestamp'>) => void;
  onSelectBusOnMap: (busId: string | null) => void;
  onSelectRouteOnMap: (routeId: string | null) => void;
  onSwitchToDispatcher: () => void;
}

export default function PassengerPortal({
  buses,
  routes,
  onReportIncident,
  onSelectBusOnMap,
  onSelectRouteOnMap,
  onSwitchToDispatcher,
}: PassengerPortalProps) {
  // Navigation & filter state
  const [selectedRouteId, setSelectedRouteId] = useState<string>(routes[0]?.id || '');
  const [selectedStopName, setSelectedStopName] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Outdoor Visibility Mode States
  const [outdoorView, setOutdoorView] = useState<boolean>(() => {
    return localStorage.getItem('passenger_outdoor_view') === 'true';
  });
  const [outdoorTheme, setOutdoorTheme] = useState<'dark' | 'light'>(() => {
    return (localStorage.getItem('passenger_outdoor_theme') as 'dark' | 'light') || 'dark';
  });

  const toggleOutdoorView = () => {
    const newVal = !outdoorView;
    setOutdoorView(newVal);
    localStorage.setItem('passenger_outdoor_view', String(newVal));
  };

  const toggleOutdoorTheme = () => {
    const newVal = outdoorTheme === 'dark' ? 'light' : 'dark';
    setOutdoorTheme(newVal);
    localStorage.setItem('passenger_outdoor_theme', newVal);
  };

  // Support / feedback form state
  const [feedbackCategory, setFeedbackCategory] = useState<string>('Lost & Found');
  const [feedbackBusId, setFeedbackBusId] = useState<string>('');
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [riderName, setRiderName] = useState<string>('');

  const selectedRoute = routes.find((r) => r.id === selectedRouteId) || routes[0];
  const activeBusesOnRoute = buses.filter((b) => b.routeId === selectedRouteId && b.status === 'online');

  // Trigger default stop select when route changes
  useEffect(() => {
    if (selectedRoute && selectedRoute.stops.length > 0) {
      setSelectedStopName(selectedRoute.stops[0].name);
    }
  }, [selectedRouteId]);

  // Compute dynamic ETAs for each stop on the selected route
  const getStopETAs = () => {
    if (!selectedRoute) return [];

    return selectedRoute.stops.map((stop, stopIdx) => {
      // Find the closest enroute bus behind or heading towards this stop
      let statusText = 'No buses enroute';
      let minutesLeft = 999;
      let closestBusPlate = '';

      activeBusesOnRoute.forEach((bus) => {
        const nextStopIdx = selectedRoute.stops.findIndex((s) => s.name === bus.nextStop);
        if (nextStopIdx === -1) return;

        // If the bus hasn't reached this stop yet
        if (stopIdx >= nextStopIdx) {
          const stopsRemaining = stopIdx - nextStopIdx;
          const estimate = Math.max(stopsRemaining * 4.5 + 2, 1);
          if (estimate < minutesLeft) {
            minutesLeft = Math.round(estimate);
            closestBusPlate = bus.licensePlate;
          }
        }
      });

      if (minutesLeft === 999) {
        statusText = 'Scheduled';
      } else if (minutesLeft <= 1) {
        statusText = 'Arriving now';
      } else {
        statusText = `In ${minutesLeft} mins`;
      }

      // Check if bus already passed this stop
      let isPassed = false;
      const firstBus = activeBusesOnRoute[0];
      if (firstBus) {
        const nextStopIdx = selectedRoute.stops.findIndex((s) => s.name === firstBus.nextStop);
        if (nextStopIdx !== -1 && stopIdx < nextStopIdx) {
          isPassed = true;
          statusText = 'Departed';
        }
      }

      return {
        stopName: stop.name,
        statusText,
        isPassed,
        minutes: minutesLeft,
        closestBus: closestBusPlate,
        lat: stop.lat,
        lng: stop.lng,
      };
    });
  };

  const stopETAs = getStopETAs();

  // Find next bus for the selected stop widget
  const selectedStopETA = stopETAs.find((s) => s.stopName === selectedStopName);

  const handleSubmitFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackMessage) return;

    // Report into live system incidents for dispatcher console mapping!
    onReportIncident({
      title: `Passenger Feedback (${feedbackCategory})`,
      priority: feedbackCategory === 'Lost & Found' ? IncidentPriority.LOW : IncidentPriority.MEDIUM,
      routeId: selectedRouteId,
      description: `Rider feedback from "${riderName || 'Anonymous passenger'}": ${feedbackMessage}. Assigned bus filter: ${feedbackBusId || 'None specified'}.`,
      status: IncidentStatus.OPEN,
      reporter: `Passenger: ${riderName || 'Anonymous Rider'} (Rider Web App)`,
    });

    setFeedbackSubmitted(true);
    setFeedbackMessage('');
    setTimeout(() => {
      setFeedbackSubmitted(false);
    }, 4500);
  };

  // Filter routes based on search
  const filteredRoutes = routes.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.destination.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (outdoorView) {
    const isDark = outdoorTheme === 'dark';
    const bgClass = isDark ? 'bg-black text-white' : 'bg-white text-black';
    const borderClass = isDark ? 'border-yellow-400' : 'border-black';
    const cardBg = isDark ? 'bg-zinc-950 border-4 border-yellow-400' : 'bg-zinc-100 border-4 border-black';
    const btnSecondary = isDark ? 'bg-zinc-900 text-white hover:bg-zinc-800 border-2 border-white' : 'bg-zinc-200 text-black hover:bg-zinc-300 border-2 border-black';
    const btnPrimary = isDark ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-4 border-yellow-400' : 'bg-black text-white hover:bg-zinc-900 border-4 border-black';
    const highlightBg = isDark ? 'bg-yellow-400 text-black' : 'bg-black text-white';

    return (
      <div className={`space-y-6 ${bgClass} p-4 md:p-8 rounded-3xl min-h-screen border-8 ${borderClass} transition-all duration-300`}>
        {/* OUTDOOR VIEW HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b-4 border-current">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-3 py-1 text-xs font-mono font-black uppercase rounded ${highlightBg} tracking-widest animate-pulse`}>
                ☀️ OUTDOOR HIGH-CONTRAST VIEW ACTIVE
              </span>
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-xs font-mono font-bold tracking-widest uppercase">GPS Live Sync</span>
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight uppercase">
              {selectedRoute ? `LINE ${selectedRoute.code} • ${selectedRoute.name}` : 'TRANSIT SCHEDULER'}
            </h1>
            <p className="text-base md:text-lg font-bold">
              Optimized with large typography scale and extreme contrast for outdoor and sunlight readability.
            </p>
          </div>

          <div className="flex flex-wrap gap-3 shrink-0">
            {/* Toggle Theme button */}
            <button
              onClick={toggleOutdoorTheme}
              className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center space-x-2 border-4 cursor-pointer shadow-md active:scale-95 ${
                isDark ? 'bg-white text-black border-white' : 'bg-black text-white border-black'
              }`}
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              <span>{isDark ? 'LIGHT MODE' : 'DARK MODE'}</span>
            </button>

            {/* Return to Standard View */}
            <button
              onClick={toggleOutdoorView}
              className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center space-x-2 border-4 cursor-pointer shadow-md active:scale-95 ${btnSecondary}`}
            >
              <Eye className="w-5 h-5" />
              <span>🖥️ STANDARD VIEW</span>
            </button>

            {/* Back to dispatch */}
            <button
              onClick={onSwitchToDispatcher}
              className={`px-5 py-3 rounded-xl font-black text-sm uppercase tracking-wider flex items-center space-x-2 border-4 cursor-pointer shadow-md active:scale-95 ${btnPrimary}`}
            >
              <span>← DISPATCH COMMANDER</span>
            </button>
          </div>
        </div>

        {/* OUTDOOR MODE BODY */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: LINE SELECTOR & Countdown */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Quick Line Selector buttons */}
            <div className={`p-6 rounded-2xl ${cardBg} space-y-4`}>
              <h2 className="text-xl font-black uppercase tracking-wider">Select Line Corridor:</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {routes.map((route) => {
                  const isSelected = selectedRouteId === route.id;
                  const count = buses.filter((b) => b.routeId === route.id && b.status === 'online').length;
                  return (
                    <button
                      key={route.id}
                      onClick={() => {
                        setSelectedRouteId(route.id);
                        onSelectRouteOnMap(route.id);
                      }}
                      className={`p-4 rounded-xl text-left border-4 transition-all duration-150 active:scale-95 cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? isDark
                            ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                            : 'bg-black text-white border-black'
                          : isDark
                          ? 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:border-zinc-500'
                          : 'bg-white text-black border-zinc-300 hover:border-zinc-500'
                      }`}
                    >
                      <span className="text-2xl font-black block leading-none mb-1">
                        LINE {route.code}
                      </span>
                      <span className="text-xs font-bold uppercase truncate block mb-2">
                        {route.name}
                      </span>
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider block opacity-80">
                        {count} BUS{count !== 1 ? 'ES' : ''}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boarding Station Dropdown & Countdown */}
            <div className={`p-6 rounded-2xl ${cardBg} space-y-6`}>
              <div className="space-y-2">
                <label className="text-lg font-black uppercase tracking-wider block">
                  Select Boarding Station Stop:
                </label>
                <select
                  value={selectedStopName}
                  onChange={(e) => setSelectedStopName(e.target.value)}
                  className={`w-full p-4 border-4 rounded-xl text-lg font-black uppercase tracking-wide focus:outline-none cursor-pointer ${
                    isDark ? 'bg-black text-white border-yellow-400' : 'bg-white text-black border-black'
                  }`}
                >
                  {selectedRoute?.stops.map((stop) => (
                    <option key={stop.name} value={stop.name}>
                      {stop.name.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* GIANT COUNTDOWN BLOCK */}
              {selectedStopETA && (
                <div className={`p-6 rounded-2xl border-4 flex flex-col md:flex-row items-center justify-between gap-4 ${
                  isDark ? 'bg-yellow-400 text-black border-white' : 'bg-black text-white border-black'
                }`}>
                  <div className="space-y-1 text-center md:text-left">
                    <span className="text-xs font-mono font-black uppercase tracking-widest block opacity-75">
                      LIVE ESTIMATED ARRIVAL
                    </span>
                    <span className="text-2xl font-black block uppercase tracking-wide">
                      {selectedStopName.toUpperCase()}
                    </span>
                    {selectedStopETA.closestBus && (
                      <span className="text-xs font-mono font-extrabold block uppercase mt-1">
                        INCOMING BUS: {selectedStopETA.closestBus}
                      </span>
                    )}
                  </div>

                  <div className="text-center md:text-right shrink-0">
                    <span className="text-4xl md:text-5xl font-black block font-mono tracking-tighter uppercase animate-pulse leading-none">
                      {selectedStopETA.statusText}
                    </span>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* RIGHT: TIMELINE & CAPACITY */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* High Contrast Seat Capacity */}
            <div className={`p-6 rounded-2xl ${cardBg} space-y-4`}>
              <h2 className="text-xl font-black uppercase tracking-wider">Coach Seat Density & Crowding:</h2>
              <div className="space-y-3">
                {activeBusesOnRoute.length === 0 ? (
                  <p className="text-base font-bold p-4 text-center border-2 border-dashed border-current opacity-70 rounded-xl">
                    No active buses enroute.
                  </p>
                ) : (
                  activeBusesOnRoute.map((bus) => {
                    const occupiedPct = (bus.passengerCount / bus.maxCapacity) * 100;
                    let densityLabel = 'Plenty of Seats';
                    let densityColor = 'text-emerald-500 bg-emerald-500/10 border-emerald-500';
                    let bgBar = 'bg-emerald-500';

                    if (occupiedPct > 80) {
                      densityLabel = 'Standing Only / Very Crowded';
                      densityColor = 'text-rose-500 bg-rose-500/10 border-rose-500';
                      bgBar = 'bg-rose-500';
                    } else if (occupiedPct > 55) {
                      densityLabel = 'Moderate Seats Available';
                      densityColor = 'text-amber-500 bg-amber-500/10 border-amber-500';
                      bgBar = 'bg-amber-500';
                    }

                    if (!isDark) {
                      // Light mode overrides for high contrast black-and-white support
                      densityColor = occupiedPct > 80 
                        ? 'text-red-700 bg-red-100 border-red-700' 
                        : occupiedPct > 55 
                        ? 'text-amber-700 bg-amber-100 border-amber-700' 
                        : 'text-emerald-700 bg-emerald-100 border-emerald-700';
                    }

                    return (
                      <div key={bus.id} className="p-4 border-2 border-current rounded-xl space-y-2">
                        <div className="flex justify-between items-baseline">
                          <span className="font-mono text-lg font-black">{bus.licensePlate}</span>
                          <span className={`text-sm font-black px-2 py-0.5 rounded border-2 uppercase ${densityColor}`}>
                            {densityLabel}
                          </span>
                        </div>
                        {/* High contrast progress bar */}
                        <div className="w-full bg-zinc-300 dark:bg-zinc-850 h-4 rounded-full overflow-hidden border-2 border-current">
                          <div className={`h-full ${bgBar}`} style={{ width: `${occupiedPct}%` }} />
                        </div>
                        <div className="flex justify-between text-xs font-mono font-black">
                          <span>SEATS FILLED: {bus.passengerCount} / {bus.maxCapacity} ({Math.round(occupiedPct)}%)</span>
                          <span>SPEED: {bus.speed} MPH</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Simplified Stop Sequence Checklist (Extra large touch target & text) */}
            <div className={`p-6 rounded-2xl ${cardBg} space-y-4`}>
              <h2 className="text-xl font-black uppercase tracking-wider">Line Stop Sequence Checklist:</h2>
              <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1">
                {stopETAs.map((stop, sIdx) => {
                  const isTarget = stop.stopName === selectedStopName;
                  const isPassed = stop.isPassed;

                  let badgeColor = 'text-zinc-500 bg-transparent border-zinc-500';
                  if (stop.statusText === 'Arriving now') {
                    badgeColor = isDark 
                      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-400' 
                      : 'text-emerald-700 bg-emerald-100 border-emerald-700';
                  } else if (stop.statusText.includes('mins')) {
                    badgeColor = isDark 
                      ? 'text-yellow-400 bg-yellow-500/10 border-yellow-400' 
                      : 'text-blue-700 bg-blue-100 border-blue-700';
                  } else if (stop.statusText === 'Departed') {
                    badgeColor = 'text-zinc-400 bg-zinc-100 border-transparent';
                  }

                  return (
                    <div
                      key={`outdoor-checklist-${stop.stopName}`}
                      onClick={() => setSelectedStopName(stop.stopName)}
                      className={`flex items-center justify-between p-4 border-4 rounded-xl cursor-pointer transition-all duration-150 active:scale-98 ${
                        isTarget
                          ? isDark
                            ? 'bg-yellow-400 text-black border-white shadow-lg'
                            : 'bg-black text-white border-black shadow-lg'
                          : isDark
                          ? 'bg-zinc-900 text-zinc-200 border-zinc-800 hover:border-zinc-700'
                          : 'bg-white text-black border-zinc-200 hover:border-zinc-300'
                      }`}
                    >
                      <div className="flex items-center space-x-4 min-w-0">
                        {/* Bullet count */}
                        <span className={`w-8 h-8 rounded-full flex items-center justify-center font-mono font-black text-xs border-2 ${
                          isTarget
                            ? 'bg-black text-white border-white'
                            : 'bg-transparent border-current'
                        }`}>
                          {sIdx + 1}
                        </span>
                        
                        <div className="min-w-0">
                          <span className={`text-base md:text-lg font-black block truncate uppercase ${
                            isPassed && !isTarget ? 'line-through opacity-50' : ''
                          }`}>
                            {stop.stopName}
                          </span>
                        </div>
                      </div>

                      <span className={`text-xs px-2 py-1 rounded font-mono font-black uppercase shrink-0 border-2 ${badgeColor}`}>
                        {stop.statusText}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Simplified support reporter */}
            <div className={`p-6 rounded-2xl ${cardBg} space-y-4`}>
              <h2 className="text-xl font-black uppercase tracking-wider">Quick Support Report:</h2>
              {feedbackSubmitted ? (
                <div className="p-5 bg-emerald-500/20 border-4 border-emerald-500 rounded-xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                  <h4 className="text-lg font-black uppercase">Report Sent Successfully</h4>
                  <p className="text-sm font-bold">
                    Logged with the main dispatcher queue. Officials have been alerted.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase">Your Name:</label>
                      <input
                        type="text"
                        required
                        placeholder="Sara Jones"
                        value={riderName}
                        onChange={(e) => setRiderName(e.target.value)}
                        className={`w-full p-3 border-4 rounded-xl text-sm font-bold uppercase focus:outline-none focus:ring-2 ${
                          isDark ? 'bg-black text-white border-zinc-700 focus:border-yellow-400' : 'bg-white text-black border-black focus:border-black'
                        }`}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-black uppercase">Category:</label>
                      <select
                        value={feedbackCategory}
                        onChange={(e) => setFeedbackCategory(e.target.value)}
                        className={`w-full p-3 border-4 rounded-xl text-sm font-bold uppercase focus:outline-none ${
                          isDark ? 'bg-black text-white border-zinc-700' : 'bg-white text-black border-black'
                        }`}
                      >
                        <option value="Lost & Found">Lost & Found</option>
                        <option value="Delay Complaint">Service Delay</option>
                        <option value="Cleanliness Issue">Cleanliness</option>
                        <option value="General Feedback">Feedback</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-black uppercase">Message / Description:</label>
                    <textarea
                      rows={2}
                      required
                      placeholder="e.g. Left phone near seat 3..."
                      value={feedbackMessage}
                      onChange={(e) => setFeedbackMessage(e.target.value)}
                      className={`w-full p-3 border-4 rounded-xl text-sm font-bold uppercase focus:outline-none resize-none ${
                        isDark ? 'bg-black text-white border-zinc-700 focus:border-yellow-400' : 'bg-white text-black border-black focus:border-black'
                      }`}
                    />
                  </div>

                  <button
                    type="submit"
                    className={`w-full py-3.5 rounded-xl font-black text-sm uppercase tracking-wider flex items-center justify-center space-x-2 border-4 cursor-pointer shadow-md active:scale-95 ${
                      isDark ? 'bg-yellow-400 text-black border-white hover:bg-yellow-300' : 'bg-black text-white border-black hover:bg-zinc-900'
                    }`}
                  >
                    <Send className="w-5 h-5" />
                    <span>TRANSMIT PASSENGER REPORT</span>
                  </button>
                </form>
              )}
            </div>

          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rider Welcome Alert Box & Mode Toggle */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-indigo-950/10 to-transparent border border-blue-500/10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-500/15 text-blue-400 border border-blue-500/25">
              RIDER COMPANION PORTAL
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] text-gray-400 font-mono">Live Sync Active</span>
          </div>
          <h2 className="text-lg font-display font-bold text-white tracking-wide">
            San Francisco Transit Passenger Portal
          </h2>
          <p className="text-xs text-gray-400 max-w-2xl">
            Check live schedules enroute, view seat capacity, trace buses visually on the rider map, and directly alert dispatcher officers with feedback.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 self-start md:self-center shrink-0">
          {/* Outdoor visibility mode button */}
          <button
            onClick={toggleOutdoorView}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black rounded-xl text-xs font-bold tracking-wide transition flex items-center space-x-1.5 shadow-md shadow-amber-900/20"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>☀️ OUTDOOR HIGH-CONTRAST VIEW</span>
          </button>

          <button
            onClick={onSwitchToDispatcher}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold tracking-wide transition flex items-center space-x-1.5 shadow-md shadow-blue-900/20"
          >
            <span>← BACK TO DISPATCH COMMANDER</span>
          </button>
        </div>
      </div>

      {/* Main Core Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* COLUMN 1: Line Explorer & Search */}
        <div className="space-y-5 lg:col-span-1">
          <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">Select Transit Line</h3>
              <p className="text-[10px] text-gray-500">Pick an active corridor line to inspect live timetables.</p>
            </div>

            {/* Route Quick Search */}
            <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs">
              <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search lines (38, 101, R...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
              />
            </div>

            {/* List of selectable Routes */}
            <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
              {filteredRoutes.map((route) => {
                const isSelected = selectedRouteId === route.id;
                const enrouteBuses = buses.filter((b) => b.routeId === route.id && b.status === 'online');

                return (
                  <button
                    key={route.id}
                    onClick={() => {
                      setSelectedRouteId(route.id);
                      onSelectRouteOnMap(route.id);
                    }}
                    className={`w-full p-3 rounded-xl border text-left transition-all relative overflow-hidden flex items-center justify-between group ${
                      isSelected
                        ? 'bg-white/[0.03] border-white/15 shadow-md'
                        : 'bg-transparent border-white/5 hover:bg-white/[0.01] hover:border-white/10'
                    }`}
                  >
                    {/* Color code strip */}
                    <div
                      className="absolute left-0 top-0 bottom-0 w-1"
                      style={{ backgroundColor: route.color }}
                    />

                    <div className="space-y-0.5 pl-1.5">
                      <div className="flex items-center space-x-1.5">
                        <span
                          className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold text-white"
                          style={{ backgroundColor: `${route.color}25`, border: `1px solid ${route.color}45` }}
                        >
                          Line {route.code}
                        </span>
                        <span className="text-xs font-bold text-gray-200 group-hover:text-white">
                          {route.name}
                        </span>
                      </div>
                      <p className="text-[10px] text-gray-500 truncate max-w-[140px]">
                        {route.origin} to {route.destination}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[10px] font-mono font-bold text-white block">
                        {enrouteBuses.length} enroute
                      </span>
                      <span className="text-[9px] text-emerald-400 font-mono">
                        {route.scheduleAdherence}% Adh
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick countdown widget for Selected Stop */}
          {selectedRoute && (
            <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-4">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">Next Bus Countdown</h3>
                <p className="text-[10px] text-gray-500">Pick a scheduled stop for dynamic ETA estimation.</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Select Your Stop Station</label>
                  <select
                    value={selectedStopName}
                    onChange={(e) => setSelectedStopName(e.target.value)}
                    className="w-full p-2 bg-[#0d0d10] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                  >
                    {selectedRoute.stops.map((stop) => (
                      <option key={stop.name} value={stop.name}>
                        {stop.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Big Live Countdown Banner */}
                {selectedStopETA && (
                  <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-blue-400 font-mono block uppercase">ESTIMATED ARRIVAL</span>
                      <span className="text-base font-display font-bold text-white block mt-0.5 leading-tight">
                        {selectedStopETA.statusText}
                      </span>
                      {selectedStopETA.closestBus && (
                        <span className="text-[9px] text-gray-500 block mt-1">
                          Incoming coach: <span className="text-gray-300 font-mono font-bold">{selectedStopETA.closestBus}</span>
                        </span>
                      )}
                    </div>
                    <div className="w-9 h-9 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                      <Clock className="w-5 h-5 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* COLUMN 2 & 3: DOUBLE PANEL - Live Map Tracker & Stop Timetable Checklist (lg:col-span-2) */}
        <div className="lg:col-span-2 flex flex-col space-y-5">
          <div className="glass-panel rounded-2xl border border-white/5 overflow-hidden flex flex-col h-[530px]">
            {/* Split layout header */}
            <div className="p-4 border-b border-white/5 bg-black/20 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">
                  Line {selectedRoute?.code || 'N/A'}: Live Route Track Map & Sequence
                </h3>
                <p className="text-[10px] text-gray-500">
                  Showing active buses enroute. Click any stop or bus to trace real-time coordinates.
                </p>
              </div>
              <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                Auto Sync Active
              </span>
            </div>

            {/* Split Core Body: SVG Map left, Timetable Checklist right */}
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2">
              {/* Left half: Self-contained Rider Tracker Map */}
              <div className="border-r border-white/5 bg-[#040407] p-3 flex flex-col justify-between relative overflow-hidden h-[240px] md:h-full">
                <InteractiveMap
                  buses={activeBusesOnRoute}
                  routes={selectedRoute ? [selectedRoute] : []}
                  selectedBusId={null}
                  onSelectBus={(id) => onSelectBusOnMap(id)}
                  selectedRouteId={selectedRoute?.id || null}
                  onSelectRoute={() => {}}
                />
              </div>

              {/* Right half: Timetable checklist */}
              <div className="p-4 flex flex-col justify-between overflow-y-auto h-[240px] md:h-full bg-black/15">
                <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-[1px] before:bg-white/10">
                  {stopETAs.map((stop, sIdx) => {
                    const isTarget = stop.stopName === selectedStopName;
                    const isPassed = stop.isPassed;

                    let badgeColor = 'text-gray-500 bg-white/[0.02] border-white/5';
                    if (stop.statusText === 'Arriving now') {
                      badgeColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
                    } else if (stop.statusText.includes('mins')) {
                      badgeColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
                    } else if (stop.statusText === 'Departed') {
                      badgeColor = 'text-gray-600 bg-transparent border-transparent';
                    }

                    return (
                      <div
                        key={`checklist-${stop.stopName}`}
                        onClick={() => setSelectedStopName(stop.stopName)}
                        className={`flex items-start pl-7 relative cursor-pointer group ${
                          isTarget ? 'opacity-100' : 'opacity-70 hover:opacity-100'
                        }`}
                      >
                        {/* Node Circle */}
                        <span
                          className={`absolute left-1.5 top-1 -translate-x-1/2 w-3.5 h-3.5 rounded-full border bg-[#0d0d10] flex items-center justify-center transition-all ${
                            isTarget
                              ? 'border-blue-400 scale-125 shadow-lg'
                              : isPassed
                              ? 'border-gray-700 bg-gray-900'
                              : 'border-white/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              isTarget ? 'bg-blue-400' : isPassed ? 'bg-gray-700' : 'bg-transparent'
                            }`}
                          />
                        </span>

                        <div className="flex-1 min-w-0 pr-2">
                          <span
                            className={`text-xs font-bold block truncate leading-none ${
                              isTarget ? 'text-blue-400' : isPassed ? 'text-gray-500 line-through' : 'text-gray-200'
                            }`}
                          >
                            {stop.stopName}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono">
                            Stop Sequence #{sIdx + 1}
                          </span>
                        </div>

                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-bold uppercase shrink-0 border ${badgeColor}`}>
                          {stop.statusText}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 shrink-0">
                  <span className="font-mono">STOPS: {stopETAs.length} TIMED</span>
                  <span className="text-gray-400">Tap stop to focus countdown</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* COLUMN 4: Capacity Indicator & Support Form */}
        <div className="space-y-5 lg:col-span-1">
          {/* Active Vehicles & Congestion status */}
          <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">Seat density indicator</h3>
              <p className="text-[10px] text-gray-500">Check enroute bus crowd levels before boarding.</p>
            </div>

            <div className="space-y-2.5">
              {activeBusesOnRoute.length === 0 ? (
                <p className="text-xs text-gray-500 p-4 bg-white/[0.01] rounded-lg border border-white/5 text-center">
                  No active coaches enroute currently.
                </p>
              ) : (
                activeBusesOnRoute.map((bus) => {
                  const occupiedPct = (bus.passengerCount / bus.maxCapacity) * 100;
                  let densityLabel = 'Plenty of Seats';
                  let densityColor = 'text-emerald-400';
                  let bgBar = 'bg-emerald-500';

                  if (occupiedPct > 80) {
                    densityLabel = 'Standing Only / Crowded';
                    densityColor = 'text-rose-400';
                    bgBar = 'bg-rose-500';
                  } else if (occupiedPct > 55) {
                    densityLabel = 'Moderate Seats';
                    densityColor = 'text-amber-400';
                    bgBar = 'bg-amber-500';
                  }

                  return (
                    <div
                      key={bus.id}
                      className="p-3 bg-white/[0.01] border border-white/5 rounded-xl space-y-2"
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="font-mono text-xs font-bold text-white">{bus.licensePlate}</span>
                        <span className={`text-[10px] font-bold ${densityColor}`}>{densityLabel}</span>
                      </div>

                      {/* Custom load bar progress */}
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${bgBar}`} style={{ width: `${occupiedPct}%` }} />
                      </div>

                      <div className="flex justify-between text-[9px] text-gray-500 font-mono">
                        <span>{bus.passengerCount} / {bus.maxCapacity} ASSIGNED</span>
                        <span>SPEED: {bus.speed} MPH</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Rider reporting / Lost & Found / Feedback form */}
          <div className="glass-panel rounded-2xl p-4 border border-white/5 space-y-4">
            <div>
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white/40">Passenger Support Center</h3>
              <p className="text-[10px] text-gray-500">Your reports are instantly routed to transit dispatcher officers.</p>
            </div>

            {feedbackSubmitted ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-xs font-bold text-white">Feedback Logged Successfully</h4>
                <p className="text-[10px] text-gray-400">
                  Rider feedback has been logged on the live Command Center board. Dispatchers have been alerted.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitFeedback} className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase">Your Name</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sara Jones"
                      value={riderName}
                      onChange={(e) => setRiderName(e.target.value)}
                      className="w-full p-2 bg-white/[0.01] border border-white/10 rounded-lg text-xs text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-mono text-gray-500 uppercase">Report Type</label>
                    <select
                      value={feedbackCategory}
                      onChange={(e) => setFeedbackCategory(e.target.value)}
                      className="w-full p-2 bg-[#0c0c0e] border border-white/10 rounded-lg text-xs text-white focus:outline-none text-gray-300 font-sans"
                    >
                      <option value="Lost & Found">Lost & Found</option>
                      <option value="Delay Complaint">Service Delay</option>
                      <option value="Cleanliness Issue">Cleanliness</option>
                      <option value="General Feedback">Feedback</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Bus Plate (Optional)</label>
                  <select
                    value={feedbackBusId}
                    onChange={(e) => setFeedbackBusId(e.target.value)}
                    className="w-full p-2 bg-[#0c0c0e] border border-white/10 rounded-lg text-xs text-white focus:outline-none text-gray-300 font-sans"
                  >
                    <option value="">-- No Specific Bus --</option>
                    {buses.map((b) => (
                      <option key={b.id} value={b.licensePlate}>
                        {b.licensePlate} ({b.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-mono text-gray-500 uppercase">Description / Message</label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Details: Left black purse near seat 4..."
                    value={feedbackMessage}
                    onChange={(e) => setFeedbackMessage(e.target.value)}
                    className="w-full p-2 bg-white/[0.01] border border-white/10 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none font-sans"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-lg transition shadow flex items-center justify-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>TRANSMIT PASSENGER REPORT</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
