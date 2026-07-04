import React, { useState } from 'react';
import { Incident, IncidentPriority, IncidentStatus, Route } from '../types';
import {
  AlertTriangle,
  AlertOctagon,
  ShieldCheck,
  LifeBuoy,
  PlusCircle,
  FileText,
  User,
  Clock,
  Radio,
} from 'lucide-react';

interface IncidentsPanelProps {
  incidents: Incident[];
  routes: Route[];
  onUpdateIncidentStatus: (id: string, status: IncidentStatus) => void;
  onReportIncident: (newInc: Omit<Incident, 'id' | 'timestamp'>) => void;
}

export default function IncidentsPanel({
  incidents,
  routes,
  onUpdateIncidentStatus,
  onReportIncident,
}: IncidentsPanelProps) {
  const [showReportForm, setShowReportForm] = useState<boolean>(false);
  const [title, setTitle] = useState<string>('');
  const [priority, setPriority] = useState<IncidentPriority>(IncidentPriority.MEDIUM);
  const [routeId, setRouteId] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;

    onReportIncident({
      title,
      priority,
      routeId: routeId || undefined,
      description,
      status: IncidentStatus.OPEN,
      reporter: 'HQ Dispatch Officer',
    });

    // Reset Form
    setTitle('');
    setDescription('');
    setRouteId('');
    setPriority(IncidentPriority.MEDIUM);
    setShowReportForm(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Incidents Live Feed Grid */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-3">
          <div>
            <h2 className="text-sm font-display font-semibold text-white tracking-wide">Incident Incident Register</h2>
            <p className="text-xs text-gray-400">Manage route delays, transponder failures, and safety alerts.</p>
          </div>

          <button
            onClick={() => setShowReportForm(!showReportForm)}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold tracking-wide flex items-center space-x-1.5 transition shadow-lg"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>REPORT INCIDENT</span>
          </button>
        </div>

        {/* List of Incidents */}
        <div className="space-y-3.5">
          {incidents.length === 0 ? (
            <p className="p-8 text-center text-gray-500 font-sans glass-panel rounded-xl border border-white/5">
              All clear! No pending incidents or safety alarms registered.
            </p>
          ) : (
            incidents.map((incident) => {
              // Priority styling
              let priorityColor = 'text-gray-400 bg-gray-500/10 border-gray-500/20';
              if (incident.priority === IncidentPriority.CRITICAL) {
                priorityColor = 'text-red-400 bg-red-500/10 border-red-500/20 animate-pulse';
              } else if (incident.priority === IncidentPriority.HIGH) {
                priorityColor = 'text-orange-400 bg-orange-500/10 border-orange-500/20';
              } else if (incident.priority === IncidentPriority.MEDIUM) {
                priorityColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
              }

              // Status badges
              let statusLabel = 'UNRESOLVED';
              let statusColor = 'text-red-400 border-red-500/30 bg-red-500/5';
              if (incident.status === IncidentStatus.RESOLVED) {
                statusLabel = 'RESOLVED';
                statusColor = 'text-emerald-400 border-emerald-500/30 bg-emerald-500/5';
              } else if (incident.status === IncidentStatus.DISPATCHED) {
                statusLabel = 'RESOLVER DISPATCHED';
                statusColor = 'text-blue-400 border-blue-500/30 bg-blue-500/5';
              }

              return (
                <div
                  key={incident.id}
                  id={`incident-card-${incident.id}`}
                  className="glass-panel rounded-xl p-4.5 border border-white/5 space-y-3.5"
                >
                  {/* Top line header */}
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div className="flex items-center space-x-2.5">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${priorityColor}`}>
                        {incident.priority.toUpperCase()}
                      </span>
                      <h3 className="text-xs font-bold text-white font-sans">{incident.title}</h3>
                    </div>

                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold border uppercase ${statusColor}`}>
                        {statusLabel}
                      </span>
                      <span className="text-[10px] font-mono text-gray-500">ID: {incident.id}</span>
                    </div>
                  </div>

                  {/* Body description */}
                  <p className="text-[11.5px] text-gray-300 leading-relaxed font-sans">{incident.description}</p>

                  {/* Diagnostics Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-[10px] font-mono text-gray-500 border-t border-white/5 pt-3">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center">
                        <User className="w-3.5 h-3.5 mr-1 text-gray-600" />
                        REPORTER: <span className="text-gray-300 font-semibold ml-1">{incident.reporter}</span>
                      </span>
                      {incident.routeId && (
                        <span className="flex items-center">
                          <Radio className="w-3.5 h-3.5 mr-1 text-gray-600" />
                          ROUTE: <span className="text-blue-400 font-semibold ml-1">{incident.routeId}</span>
                        </span>
                      )}
                    </div>

                    {/* Incident update buttons */}
                    {incident.status !== IncidentStatus.RESOLVED && (
                      <div className="flex items-center space-x-1.5">
                        {incident.status === IncidentStatus.OPEN && (
                          <button
                            onClick={() => onUpdateIncidentStatus(incident.id, IncidentStatus.DISPATCHED)}
                            className="px-2 py-1 bg-blue-500/10 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 rounded transition text-[10px] font-bold uppercase flex items-center space-x-1"
                          >
                            <LifeBuoy className="w-3 h-3" />
                            <span>DISPATCH HELP</span>
                          </button>
                        )}
                        <button
                          onClick={() => onUpdateIncidentStatus(incident.id, IncidentStatus.RESOLVED)}
                          className="px-2 py-1 bg-emerald-500/10 hover:bg-emerald-600 border border-emerald-500/20 text-emerald-400 hover:text-white rounded transition text-[10px] font-bold uppercase flex items-center space-x-1"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          <span>RESOLVE INCIDENT</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Manual Report Incident Sidebar Column */}
      <div className="lg:col-span-1">
        {showReportForm ? (
          <form
            onSubmit={handleSubmit}
            className="glass-panel rounded-2xl p-5 border border-white/10 space-y-4 animate-slide-in"
          >
            <div className="flex justify-between items-center border-b border-white/5 pb-2">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Manual incident Form</h3>
              <button
                type="button"
                onClick={() => setShowReportForm(false)}
                className="text-xs text-rose-400 hover:text-rose-300 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Incident title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Engine Overheat Indicator"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2 bg-white/[0.02] border border-white/10 rounded-md text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Priority Select */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Priority tag</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as IncidentPriority)}
                  className="w-full p-2 bg-[#0a0a0c] border border-white/10 rounded-md text-xs text-white focus:outline-none"
                >
                  <option value={IncidentPriority.LOW}>Low priority</option>
                  <option value={IncidentPriority.MEDIUM}>Medium priority</option>
                  <option value={IncidentPriority.HIGH}>High priority</option>
                  <option value={IncidentPriority.CRITICAL}>Critical alarm</option>
                </select>
              </div>

              {/* Route */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Affected Route (Optional)</label>
                <select
                  value={routeId}
                  onChange={(e) => setRouteId(e.target.value)}
                  className="w-full p-2 bg-[#0a0a0c] border border-white/10 rounded-md text-xs text-white focus:outline-none"
                >
                  <option value="">-- No Specific Route --</option>
                  {routes.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.code}] {r.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">Incident explanation</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the mechanical or operator warning report..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-white/[0.02] border border-white/10 rounded-md text-xs text-white placeholder-gray-600 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs tracking-wider rounded-lg transition shadow-md"
              >
                DISPATCH ALARM SIGNALS
              </button>
            </div>
          </form>
        ) : (
          <div className="glass-panel rounded-2xl p-5 border border-white/5 space-y-4 text-center">
            <FileText className="w-8 h-8 text-white/10 mx-auto" />
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white">Manual incident Forms</h3>
            <p className="text-xs text-gray-400">
              Need to manual register a passenger issue, weather warning, or mechanical road block?
            </p>
            <button
              onClick={() => setShowReportForm(true)}
              className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 rounded-lg text-xs font-semibold tracking-wider transition"
            >
              CREATE MANUAL LOG
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
