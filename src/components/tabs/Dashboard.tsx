import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Calendar } from "lucide-react";
import { StatCard } from "../StatCard";
import { io, Socket } from "socket.io-client";

const WS_URL = import.meta.env.VITE_WS_URL || "http://localhost:3000";

interface Stats {
  currentShift: string;
  updatedAt: string;
  totalEmployees: { male: number; female: number; format?: () => string };
  present: { male: number; female: number; total: number; format?: () => string };
  absent: { male: number; female: number; total: number; format?: () => string };
  lateComing: { male: number; female: number; total: number; percentage: string; format?: () => string };
  restDayShift: { male: number; female: number; total: number; todayFormatted?: string; format?: () => string };
}

interface Log {
  id: string;
  name: string;
  project: string;
  checkInTime: string;
  timestamp: string;
  status: string;
}

export const Dashboard = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [logs, setLogs] = useState<Log[]>([]);
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

  // Format M/F helper
  const formatMF = (obj: any): string => {
    if (!obj) return "M: 0 | F: 0";
    if (typeof obj.format === "function") return obj.format();
    return `M: ${obj.male ?? 0} | F: ${obj.female ?? 0}`;
  };

  // Shift styling
  const shiftColors: Record<string, string> = {
    Morning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Noon: "bg-blue-100 text-blue-800 border-blue-300",
    Night: "bg-green-100 text-green-800 border-green-300",
  };

  const shiftTimings: Record<string, string> = {
    Morning: "5:30 AM - 1:30 PM",
    Noon: "1:30 PM - 9:30 PM",
    Night: "9:30 PM - 5:30 AM",
  };

  const statusColors: Record<string, string> = {
    "On time": "bg-green-100 text-green-800",
    Late: "bg-yellow-100 text-yellow-800",
    "Half day": "bg-orange-100 text-orange-800",
    "Early Punchout": "bg-purple-100 text-purple-800",
    Absent: "bg-red-100 text-red-800",
  };

  // WebSocket Connection
  useEffect(() => {
    const socket: Socket = io(WS_URL, {
      transports: ["websocket"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 3000,
    });

    socket.on("connect", () => {
      console.log("Real-time dashboard connected");
      setConnectionStatus("connected");
      setLoading(false);
    });

    socket.on("connect_error", (err) => {
      console.error("WebSocket error:", err);
      setConnectionStatus("disconnected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
    });

    socket.on("dashboard-update", (payload: { stats: Stats; logs: Log[]; updatedAt: string }) => {
      setStats(payload.stats);
      setLogs(payload.logs || []);
      setLoading(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const latest50Logs = [...logs]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);

  return (
    <div className="space-y-12 p-6">
      {/* Connection Status + Current Shift */}
      <div className="flex items-center justify-between">
        <div className={`rounded-2xl border-4 p-2 text-center flex-1 ${shiftColors[stats?.currentShift || "Morning"]}`}>
          <h2 className="text-2xl font-bold">
            Current Shift: {stats?.currentShift || "Loading..."}
          </h2>
          <p className="text-2xl mt-2 opacity-90">
            {stats?.currentShift ? shiftTimings[stats.currentShift] : "Please wait..."}
          </p>
        </div>

        {/* Live Indicator */}
        {/* <div className="flex items-center gap-3 bg-gray-900 text-white px-6 py-4 rounded-2xl">
          <div className={`w-4 h-4 rounded-full ${connectionStatus === "connected" ? "bg-green-400 animate-pulse" : "bg-red-500"}`} />
          <span className="font-semibold text-lg">
            {connectionStatus === "connected" ? "LIVE" : connectionStatus.toUpperCase()}
          </span>
          {stats?.updatedAt && (
            <span className="text-sm opacity-75">
              {new Date(stats.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          )}
        </div> */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-gray-200 border-2 border-dashed rounded-xl h-48 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard title="Total Employees" value={formatMF(stats.totalEmployees)} icon={Users} color="blue" />
            <StatCard title="Present (Current Shift)" value={formatMF(stats.present)} icon={CheckCircle} color="green" />
            <StatCard title="Absent (Current Shift)" value={formatMF(stats.absent)} icon={XCircle} color="red" />
            <StatCard
              title="Late Coming (Current Shift)"
              value={formatMF(stats.lateComing)}
              subtitle={stats.lateComing?.percentage ? `${stats.lateComing.percentage} of shift` : ""}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Rest Days (Today)"
              value={formatMF(stats.restDayShift)}
              subtitle={stats.restDayShift?.todayFormatted || "No one on RD"}
              icon={Calendar}
              color="orange"
            />
          </>
        ) : (
          <p className="col-span-full text-center text-red-600 text-2xl">No data received from server</p>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            Latest Check-ins - {stats?.currentShift || "All"} Shift
          </h3>
          <p className="text-sm text-gray-600 mt-1">Real-time updates • Showing latest 50</p>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Connecting to live data...</p>
          </div>
        ) : latest50Logs.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-xl">No check-ins yet today</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Project</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Time</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {latest50Logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-8 py-4 text-sm font-medium text-gray-900">{log.id}</td>
                    <td className="px-8 py-4 text-sm text-gray-900">{log.name || "Unknown"}</td>
                     <td className="px-8 py-4 text-sm text-gray-900">{log.project || "Unknown"}</td>
                    <td className="px-8 py-4 text-sm text-gray-600">{log.checkInTime}</td>
                    <td className="px-8 py-4 text-sm">
                      <span
                        className={`px-4 py-2 rounded-full text-xs font-bold ${
                          statusColors[log.status] || "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};