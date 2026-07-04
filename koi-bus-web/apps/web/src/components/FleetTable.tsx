import React, { useState } from 'react';
import { Search, SlidersHorizontal, Navigation, ShieldAlert, Edit2 } from 'lucide-react';

interface FleetTableProps {
  buses: any[];
  onSelectBus: (busId: string | null) => void;
}

type SortField = 'licensePlate' | 'speed' | 'passengerCount' | 'scheduleDelay';
type SortOrder = 'asc' | 'desc';

export default function FleetTable({ buses, onSelectBus }: FleetTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('licensePlate');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const filteredBuses = buses
    .filter((bus) => {
      const licensePlate = bus.licensePlate || '';
      const matchesSearch = licensePlate.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortField === 'licensePlate') {
        comparison = (a.licensePlate || '').localeCompare(b.licensePlate || '');
      } else if (sortField === 'speed') {
        comparison = (a.trip?.speed || 0) - (b.trip?.speed || 0);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

  return (
    <div className="glass-panel rounded-2xl p-6 border border-white/5 space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-base font-display font-semibold text-white tracking-wide">Fleet Operations Grid</h2>
          <p className="text-xs text-gray-400">Sort, query, and manage active dispatch assets.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center bg-white/[0.02] border border-white/10 rounded-lg px-3 py-1.5 w-64">
            <Search className="w-4 h-4 text-gray-500 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-transparent text-xs text-white placeholder-gray-500 focus:outline-none w-full"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5 text-[10px] font-mono font-bold uppercase tracking-wider text-white/50">
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('licensePlate')}>
                Bus ID {sortField === 'licensePlate' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-4">Status</th>
              <th className="p-4 cursor-pointer hover:text-white" onClick={() => handleSort('speed')}>
                Velocity {sortField === 'speed' && (sortOrder === 'asc' ? '▲' : '▼')}
              </th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5 text-xs text-gray-300">
            {filteredBuses.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-500 font-sans">
                  No operational fleet buses found matching current search filters.
                </td>
              </tr>
            ) : (
              filteredBuses.map((bus) => {
                const statusBadge = (
                  <span className="flex items-center space-x-1.5 text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full w-fit animate-pulse">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 glow-indicator-active" />
                    <span className="font-mono text-[9px] uppercase tracking-wider">ONLINE</span>
                  </span>
                );

                return (
                  <tr
                    key={bus.id}
                    className="hover:bg-white/[0.02] transition-colors duration-150 align-middle relative group"
                  >
                    <td className="p-4 font-mono font-semibold text-white">
                      <button
                        onClick={() => onSelectBus(bus.id)}
                        className="text-left hover:text-blue-400 transition"
                      >
                        {bus.licensePlate}
                      </button>
                    </td>

                    <td className="p-4">{statusBadge}</td>

                    <td className="p-4 font-mono font-medium text-white text-sm">
                      {bus.trip?.speed || 0} <span className="text-[10px] text-gray-500 font-normal">MPH</span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => onSelectBus(bus.id)}
                          className="px-2 py-1 bg-blue-500/15 hover:bg-blue-500 text-blue-400 hover:text-white border border-blue-500/20 rounded transition text-[10px] font-semibold flex items-center space-x-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>LOCATE</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
