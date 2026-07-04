import React, { useState } from 'react';
import { Device, Bus } from '../types';
import {
  Cpu,
  Wifi,
  HardDrive,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  RefreshCcw,
  Clock,
  Terminal,
} from 'lucide-react';

interface DevicesPanelProps {
  devices: Device[];
  buses: Bus[];
  onPingDevice: (deviceId: string) => void;
}

export default function DevicesPanel({ devices, buses, onPingDevice }: DevicesPanelProps) {
  const [pingingId, setPingingId] = useState<string | null>(null);
  const [pingResult, setPingResult] = useState<{ [id: string]: string }>({});

  const handlePing = (id: string) => {
    setPingingId(id);
    setTimeout(() => {
      setPingingId(null);
      setPingResult((prev) => ({
        ...prev,
        [id]: `RESP: 64 bytes from ${devices.find((d) => d.id === id)?.ip}: icmp_seq=1 ttl=64 time=${(
          5 +
          Math.random() * 20
        ).toFixed(1)}ms`,
      }));
    }, 1200);
  };

  return (
    <div className="space-y-6">
      {/* Top statistics section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-4 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl">
            <CheckCircle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              {devices.filter((d) => d.status === 'healthy').length}
            </h3>
            <p className="text-xs text-gray-400">Healthy Devices Active</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              {devices.filter((d) => d.status === 'warning').length}
            </h3>
            <p className="text-xs text-gray-400">Systems with Latency Warnings</p>
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl flex items-center space-x-4">
          <div className="p-3 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-xl">
            <AlertOctagon className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-display font-bold text-white">
              {devices.filter((d) => d.status === 'error').length}
            </h3>
            <p className="text-xs text-gray-400">Offline Transponders</p>
          </div>
        </div>
      </div>

      {/* Grid of Devices */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {devices.map((device) => {
          const associatedBus = buses.find((b) => b.id === device.busId);

          // Signal strength labels
          let signalColor = 'text-gray-500';
          if (device.gpsSignal === 'strong') signalColor = 'text-emerald-400';
          if (device.gpsSignal === 'weak') signalColor = 'text-amber-400';

          // Status Badge details
          let statusBadgeColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
          let statusText = 'OFFLINE ERROR';
          if (device.status === 'healthy') {
            statusBadgeColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            statusText = 'HEALTHY OK';
          } else if (device.status === 'warning') {
            statusBadgeColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse';
            statusText = 'HIGH LOAD';
          }

          return (
            <div
              key={device.id}
              className="glass-panel rounded-xl p-5 border border-white/5 space-y-4 flex flex-col justify-between"
            >
              {/* Header */}
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-sm font-display font-bold text-white">{device.name}</h3>
                    <span className="text-[9px] font-mono font-bold text-gray-500 px-1.5 py-0.5 rounded border border-white/5">
                      {device.firmwareVersion}
                    </span>
                  </div>
                  <p className="text-[10px] font-mono text-gray-400 mt-1">IP: {device.ip}</p>
                </div>

                <span className={`px-2 py-0.5 text-[9px] font-mono font-bold rounded border ${statusBadgeColor}`}>
                  {statusText}
                </span>
              </div>

              {/* Hardware stats */}
              <div className="grid grid-cols-3 gap-3">
                {/* Memory usage */}
                <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase">
                    <span>RAM USED</span>
                    <HardDrive className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-base font-bold ${device.memoryUsed > 80 ? 'text-red-400' : 'text-white'}`}>
                      {device.memoryUsed}%
                    </span>
                  </div>
                  {/* Minibar */}
                  <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${device.memoryUsed > 80 ? 'bg-red-500' : 'bg-blue-500'}`}
                      style={{ width: `${device.memoryUsed}%` }}
                    />
                  </div>
                </div>

                {/* CPU Temperature */}
                <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase">
                    <span>CPU TEMP</span>
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div className="flex items-baseline space-x-1">
                    <span className={`text-base font-bold ${device.cpuTemp > 60 ? 'text-amber-400' : 'text-white'}`}>
                      {device.cpuTemp}°C
                    </span>
                  </div>
                  {/* Minibar */}
                  <div className="w-full bg-white/5 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${device.cpuTemp > 60 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                      style={{ width: `${Math.min((device.cpuTemp / 100) * 100, 100)}%` }}
                    />
                  </div>
                </div>

                {/* GPS Signal */}
                <div className="bg-white/[0.01] border border-white/5 rounded-lg p-2.5">
                  <div className="flex items-center justify-between text-[10px] text-gray-500 mb-1 font-mono uppercase">
                    <span>GPS STATE</span>
                    <Wifi className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-xs font-bold block uppercase mt-0.5 ${signalColor}`}>
                    {device.gpsSignal}
                  </span>
                  <span className="text-[9px] text-gray-500 font-mono block mt-1">
                    PING: {device.lastPing}
                  </span>
                </div>
              </div>

              {/* Ping Console output */}
              {pingResult[device.id] && (
                <div className="p-2 bg-black/60 rounded-lg border border-white/5 font-mono text-[9px] text-emerald-400 flex items-start space-x-2">
                  <Terminal className="w-3 h-3 text-emerald-500 shrink-0 mt-0.5" />
                  <span className="break-all">{pingResult[device.id]}</span>
                </div>
              )}

              {/* Footer row with actions */}
              <div className="flex items-center justify-between border-t border-white/5 pt-3">
                <span className="text-[10px] font-mono text-gray-400">
                  ASSIGNED TO:{' '}
                  {associatedBus ? (
                    <span className="text-white font-bold">{associatedBus.licensePlate}</span>
                  ) : (
                    <span className="text-gray-600">UNASSIGNED DEPOT</span>
                  )}
                </span>

                <button
                  onClick={() => handlePing(device.id)}
                  disabled={pingingId !== null}
                  className={`px-3 py-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-[10px] font-mono uppercase tracking-wide text-white flex items-center space-x-1.5 transition ${
                    pingingId ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <RefreshCcw className={`w-3 h-3 ${pingingId === device.id ? 'animate-spin' : ''}`} />
                  <span>{pingingId === device.id ? 'PINGING...' : 'PING DEVICE'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
