import React from 'react';
import { AlertCircle, CheckCircle, Info, RefreshCw, Trash2, WifiOff } from 'lucide-react';
import { Activity } from '../types';

interface ActivityFeedProps {
  activities: Activity[];
  onClearActivities: () => void;
  onSimulateNewActivity: () => void;
}

export default function ActivityFeed({
  activities,
  onClearActivities,
  onSimulateNewActivity,
}: ActivityFeedProps) {
  return (
    <div className="w-80 shrink-0 glass-panel rounded-2xl p-4 flex flex-col border border-white/5 h-[580px]">
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <RefreshCw className="w-4 h-4 text-blue-500 animate-spin-slow shrink-0" />
          <h2 className="text-sm font-display font-semibold text-white tracking-wide">Live Feed</h2>
        </div>
        <div className="flex items-center space-x-1.5">
          <button
            onClick={onSimulateNewActivity}
            className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-2 py-1 rounded transition font-mono uppercase"
          >
            + SIMULATE
          </button>
          <button
            onClick={onClearActivities}
            className="p-1 text-gray-500 hover:text-white rounded hover:bg-white/5 transition"
            title="Clear Feed Log"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Feed List container */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {activities.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6">
            <Info className="w-8 h-8 text-white/10 mb-2" />
            <p className="text-xs text-gray-500 font-sans">No recent activity logs.</p>
            <button
              onClick={onSimulateNewActivity}
              className="mt-3 text-[10px] text-blue-400 underline font-mono uppercase tracking-wider"
            >
              Trigger Simulation Signal
            </button>
          </div>
        ) : (
          activities.map((activity, idx) => {
            // Pick corresponding icon & colors based on type
            let Icon = Info;
            let iconColor = 'text-blue-400 bg-blue-500/10 border-blue-500/20';
            if (activity.type === 'success') {
              Icon = CheckCircle;
              iconColor = 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
            } else if (activity.type === 'warning') {
              Icon = AlertCircle;
              iconColor = 'text-amber-400 bg-amber-500/10 border-amber-500/20';
            } else if (activity.type === 'error') {
              Icon = WifiOff;
              iconColor = 'text-red-400 bg-red-500/10 border-red-500/20';
            }

            return (
              <div
                key={activity.id}
                id={`activity-${activity.id}`}
                className="p-2.5 rounded-lg bg-white/[0.01] border border-white/5 flex items-start space-x-3 hover:bg-white/[0.03] transition duration-200"
              >
                {/* Indicator icon */}
                <div className={`p-1.5 rounded-md border shrink-0 ${iconColor}`}>
                  <Icon className="w-3.5 h-3.5" />
                </div>

                {/* Log message */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-gray-300 leading-relaxed font-sans font-medium break-words">
                    {activity.message}
                  </p>
                  <span className="text-[9px] font-mono text-white/30 block mt-1">
                    {activity.timestamp} • SYSTEM CORE
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-white/5 bg-black/20 rounded p-2.5">
        <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>Active Connections:</span>
          <span className="text-emerald-400 font-bold">7 Vehicles Online</span>
        </div>
        <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden mt-1.5">
          <div className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full w-[88%]" />
        </div>
      </div>
    </div>
  );
}
