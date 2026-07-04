import React, { useState } from 'react';
import { Driver, DriverStatus } from '../types';
import {
  Users,
  Activity,
  Award,
  AlertTriangle,
  Clock,
  Phone,
  Power,
  Search,
  SlidersHorizontal,
} from 'lucide-react';

interface DriversPanelProps {
  drivers: Driver[];
  onUpdateDriverStatus: (driverId: string, status: DriverStatus) => void;
}

export default function DriversPanel({ drivers, onUpdateDriverStatus }: DriversPanelProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredDrivers = drivers.filter((driver) => {
    const matchesSearch =
      driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      driver.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || driver.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {/* Header and Controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-display font-semibold text-white tracking-wide">Operator Crew Shift Board</h2>
          <p className="text-xs text-gray-400">Track active duty shifts, safety compliance metrics, and fatigue levels.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-lg px-3 py-1.5 w-60">
            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search driver by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
            />
          </div>

          <div className="flex items-center space-x-1 bg-white/[0.02] border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-gray-300">
            <SlidersHorizontal className="w-3.5 h-3.5 text-gray-500 mr-1" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent focus:outline-none font-medium cursor-pointer text-white"
            >
              <option value="all" className="bg-[#0e0e11] text-gray-300">All Shift Modes</option>
              <option value={DriverStatus.ONLINE} className="bg-[#0e0e11] text-emerald-400">On Active Duty</option>
              <option value={DriverStatus.BREAK} className="bg-[#0e0e11] text-blue-400">On Scheduled Break</option>
              <option value={DriverStatus.OFFLINE} className="bg-[#0e0e11] text-gray-400">Checked Out / Offline</option>
            </select>
          </div>
        </div>
      </div>

      {/* Driver cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDrivers.map((driver) => {
          // Status styling
          let statusLabel = 'Offline';
          let statusColor = 'text-gray-400 bg-gray-500/10 border-gray-500/20';
          if (driver.status === DriverStatus.ONLINE) {
            statusLabel = 'Active Shift';
            statusColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
          } else if (driver.status === DriverStatus.BREAK) {
            statusLabel = 'On Rest Break';
            statusColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
          }

          // Fatigue indicators
          const isFatigueHigh = driver.fatigueScore >= 70;

          return (
            <div
              key={driver.id}
              id={`driver-card-${driver.id}`}
              className="glass-panel rounded-xl p-4 border border-white/5 flex flex-col justify-between space-y-4"
            >
              {/* Profile Details Header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3.5">
                  <img
                    src={driver.avatar}
                    alt={driver.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/10"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-xs font-bold text-white leading-none">{driver.name}</h3>
                    <span className="text-[10px] font-mono text-gray-500 mt-1 block">ID: {driver.id}</span>
                    <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full border font-bold uppercase tracking-wider mt-1.5 ${statusColor}`}>
                      {statusLabel}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-display font-bold text-white flex items-center justify-end">
                    ★ {driver.rating}
                  </span>
                  <span className="text-[9px] text-gray-500 uppercase font-mono block">Safety score</span>
                </div>
              </div>

              {/* Duty statistics */}
              <div className="grid grid-cols-2 gap-2 text-xs py-2.5 border-t border-b border-white/5 font-sans">
                <div className="flex items-center text-gray-400 space-x-2">
                  <Clock className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>Shift started:</span>
                </div>
                <div className="text-right font-medium text-white">
                  {driver.status === DriverStatus.OFFLINE ? '--' : driver.currentShiftStarted.substring(11, 16) + ' UTC'}
                </div>

                <div className="flex items-center text-gray-400 space-x-2">
                  <Award className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                  <span>Total logged:</span>
                </div>
                <div className="text-right font-medium text-white font-mono">
                  {driver.totalHours} hrs
                </div>
              </div>

              {/* Fatigue Scoring bar */}
              {driver.status !== DriverStatus.OFFLINE && (
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline">
                    <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wide">FATIGUE INDEX</span>
                    <span
                      className={`text-[10px] font-mono font-bold ${
                        isFatigueHigh ? 'text-red-400 animate-pulse' : 'text-emerald-400'
                      }`}
                    >
                      {driver.fatigueScore}% {isFatigueHigh ? 'CRITICAL WARN' : 'SAFE'}
                    </span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        isFatigueHigh ? 'bg-red-500' : driver.fatigueScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${driver.fatigueScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Dispatch Action Panel */}
              <div className="flex items-center justify-between pt-1.5 gap-2.5">
                <a
                  href={`tel:${driver.phone}`}
                  className="flex items-center justify-center space-x-1.5 bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 p-2 rounded-lg text-[10px] font-semibold transition"
                >
                  <Phone className="w-3 h-3" />
                  <span>CALL</span>
                </a>

                {/* Shift status toggler */}
                <div className="flex items-center space-x-1.5">
                  <button
                    onClick={() =>
                      onUpdateDriverStatus(
                        driver.id,
                        driver.status === DriverStatus.ONLINE ? DriverStatus.BREAK : DriverStatus.ONLINE
                      )
                    }
                    disabled={driver.status === DriverStatus.OFFLINE}
                    className={`px-2 py-2 rounded-lg text-[10px] font-semibold border transition ${
                      driver.status === DriverStatus.OFFLINE
                        ? 'bg-transparent border-transparent text-gray-600 cursor-not-allowed'
                        : driver.status === DriverStatus.ONLINE
                        ? 'bg-blue-500/10 hover:bg-blue-600 border-blue-500/20 text-blue-400 hover:text-white'
                        : 'bg-emerald-500/10 hover:bg-emerald-600 border-emerald-500/20 text-emerald-400 hover:text-white'
                    }`}
                  >
                    {driver.status === DriverStatus.ONLINE ? 'SHIFT BREAK' : 'RESUME DUTY'}
                  </button>

                  <button
                    onClick={() =>
                      onUpdateDriverStatus(
                        driver.id,
                        driver.status === DriverStatus.OFFLINE ? DriverStatus.ONLINE : DriverStatus.OFFLINE
                      )
                    }
                    className={`px-2.5 py-2 rounded-lg text-[10px] font-semibold border flex items-center space-x-1 transition ${
                      driver.status === DriverStatus.OFFLINE
                        ? 'bg-emerald-500/10 hover:bg-emerald-600 border-emerald-500/20 text-emerald-400 hover:text-white'
                        : 'bg-red-500/10 hover:bg-red-600 border-red-500/20 text-red-400 hover:text-white'
                    }`}
                  >
                    <Power className="w-3 h-3" />
                    <span>{driver.status === DriverStatus.OFFLINE ? 'LOGIN' : 'LOGOUT'}</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
