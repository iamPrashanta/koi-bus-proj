"use client";

import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/stores/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Bus,
  MapPin,
  Cpu,
  Clock,
  Play,
  Pause,
  Square,
  RotateCcw,
  AlertCircle,
  Loader2,
  User,
} from "lucide-react";

interface Assignment {
  tripId: number;
  routeName: string;
  routeCode: string;
  busNumber: string;
  deviceId: string;
  driverName: string;
  shiftStart: string;
  status: string;
}

export default function DriverDashboard() {
  const { user } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Fetch current assignment on mount
  useEffect(() => {
    fetchAssignment();
  }, []);

  const fetchAssignment = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await api.get("/driver/assignment");
      setAssignment(res.data.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        // No driver profile — this is expected for fresh accounts
        setAssignment(null);
        setError(err.response?.data?.error || "No driver profile found.");
      } else {
        setError(err.response?.data?.error || "Failed to fetch assignment.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (action: "start" | "pause" | "resume" | "end") => {
    if (!assignment) return;

    setActionLoading(true);
    setMessage("");
    try {
      await api.post(`/trips/${assignment.tripId}/${action}`);
      const statusMap: Record<string, string> = {
        start: "ONGOING",
        pause: "SCHEDULED",
        resume: "ONGOING",
        end: "COMPLETED",
      };
      setAssignment((prev) =>
        prev ? { ...prev, status: statusMap[action] } : null
      );
      setMessage(
        action === "start"
          ? "Trip started successfully!"
          : action === "pause"
          ? "Trip paused."
          : action === "resume"
          ? "Trip resumed."
          : "Trip ended successfully."
      );
      if (action === "end") {
        // Refetch — assignment may be cleared now
        setTimeout(fetchAssignment, 1000);
      }
    } catch (err: any) {
      setMessage(`Error: ${err.response?.data?.error || err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-400" />
        <span className="ml-3 text-zinc-400 text-sm">Loading assignment...</span>
      </div>
    );
  }

  // No assignment state
  if (!assignment) {
    return (
      <div className="max-w-lg mx-auto mt-12">
        <Card className="bg-zinc-900 border-zinc-800 text-white">
          <CardContent className="flex flex-col items-center justify-center py-16 space-y-4">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-zinc-800 border border-zinc-700">
              <AlertCircle className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-lg font-display font-bold text-white">
              No Active Assignment
            </h3>
            <p className="text-sm text-zinc-400 text-center max-w-xs">
              {error || "Contact your operator for route assignment."}
            </p>
            <Button
              onClick={fetchAssignment}
              variant="outline"
              className="mt-4 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOngoing = assignment.status === "ONGOING";
  const isPaused = assignment.status === "SCHEDULED";
  const isCompleted = assignment.status === "COMPLETED";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Assignment Card */}
      <Card className="bg-zinc-900 border-zinc-800 text-white overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600/10 to-indigo-600/5 border-b border-zinc-800">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-display">Active Trip Assignment</CardTitle>
            <span
              className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded border ${
                isOngoing
                  ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                  : isPaused
                  ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
                  : isCompleted
                  ? "bg-zinc-500/20 text-zinc-400 border-zinc-500/30"
                  : "bg-blue-500/20 text-blue-400 border-blue-500/30"
              }`}
            >
              {assignment.status}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-5">
          {/* Trip details grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-blue-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Route</p>
                <p className="text-sm font-semibold text-white">{assignment.routeName}</p>
                <p className="text-xs text-zinc-500 font-mono">{assignment.routeCode}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Bus className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Bus</p>
                <p className="text-sm font-semibold text-white">{assignment.busNumber}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Cpu className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Device ID</p>
                <p className="text-sm font-mono text-white">{assignment.deviceId}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Shift Start</p>
                <p className="text-sm font-mono text-white">
                  {new Date(assignment.shiftStart).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 col-span-2">
              <User className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-[10px] font-mono text-zinc-500 uppercase">Driver</p>
                <p className="text-sm font-semibold text-white">{assignment.driverName}</p>
              </div>
            </div>
          </div>

          {/* Trip ID */}
          <div className="flex items-center justify-between bg-zinc-800/50 rounded-lg px-4 py-2.5 border border-zinc-700/50">
            <span className="text-xs text-zinc-400">Trip ID</span>
            <span className="text-xs font-mono font-bold text-white">#{assignment.tripId}</span>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <Button
              onClick={() => handleAction("start")}
              disabled={actionLoading || isOngoing || isCompleted}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Trip
            </Button>
            <Button
              onClick={() => handleAction("pause")}
              disabled={actionLoading || !isOngoing}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              <Pause className="w-4 h-4 mr-2" />
              Pause Trip
            </Button>
            <Button
              onClick={() => handleAction("resume")}
              disabled={actionLoading || !isPaused}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Resume Trip
            </Button>
            <Button
              onClick={() => handleAction("end")}
              disabled={actionLoading || (!isOngoing && !isPaused)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Square className="w-4 h-4 mr-2" />
              End Trip
            </Button>
          </div>

          {/* Status message */}
          {message && (
            <div className="p-3 text-sm rounded-lg bg-zinc-800/50 text-zinc-300 border border-zinc-700">
              {message}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
