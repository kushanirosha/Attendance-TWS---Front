import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Calendar, LogOut } from "lucide-react";
import { StatCard } from "../StatCard";
import { fetchEmployeeStats } from "../../services/statCardService";

export const Dashboard = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = async () => {
    try {
      const res = await fetch("http://localhost:3000/api/attendance");
      if (!res.ok) throw new Error("Network error");
      const json = await res.json();
      return json.success ? json.data : [];
    } catch (err) {
      console.error("Fetch attendance failed:", err);
      return [];
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [attendanceData, statsData] = await Promise.all([
          fetchAttendance(),
          fetchEmployeeStats(), // This now returns lateComing with gender!
        ]);
        setAttendance(attendanceData);
        setStats(statsData);
      } catch (err) {
        console.error("Load error:", err);
      } finally {
        setLoading(false);
      }
    };
    loadData();

    // Optional: Auto-refresh every 15 seconds
    const interval = setInterval(loadData, 15000);
    return () => clearInterval(interval);
  }, []);

  const formatMF = (obj: any) => {
    if (!obj) return "M: 0 | F: 0";
    if (typeof obj.format === "function") return obj.format();
    return `M: ${obj.male ?? 0} | F: ${obj.female ?? 0}`;
  };

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

  const latest50Logs = [...attendance]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 50);

  return (
    <div className="space-y-8 p-6">
      {/* Current Shift */}
      <div className={`rounded-2xl border-4 p-4 text-center ${shiftColors[stats?.currentShift || "Morning"]}`}>
        <h2 className="text-2xl font-bold">
          Current Shift: {stats?.currentShift || "Loading..."}
        </h2>
        <p className="text-2xl mt-3 opacity-90">
          {stats?.currentShift ? shiftTimings[stats.currentShift] : "Please wait..."}
        </p>
        {/* {stats?.updatedAt && (
          <p className="text-sm mt-2 opacity-70">Updated: {stats.updatedAt}</p>
        )} */}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-8">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-200 border-2 border-dashed rounded-xl h-48 animate-pulse" />
          ))
        ) : stats ? (
          <>
            <StatCard title="Total Employees" value={formatMF(stats.totalEmployees)} icon={Users} color="blue" />
            <StatCard title="Present (Current Shift)" value={formatMF(stats.present)} icon={CheckCircle} color="green" />
            <StatCard title="Absent (Current Shift)" value={formatMF(stats.absent)} icon={XCircle} color="red" />

            {/* LATE COMING — NOW WITH GENDER FROM BACKEND */}
            <StatCard
              title="Late Coming (Current Shift)"
              value={formatMF(stats.lateComing)}
              subtitle={stats.lateComing?.percentage ? `${stats.lateComing.percentage} of shift` : ""}
              icon={Clock}
              color="yellow"
            />

            <StatCard
              title="Rest Day (Today)"
              value={formatMF(stats.restDayShift)}
              subtitle={stats.restDayShift?.todayFormatted || "No one on RD today"}
              icon={Calendar}
              color="orange"
            />

            {/* <StatCard
              title="Admin (Today)"
              value={formatMF(stats.lateComing)}
              icon={LogOut}
              color="purple"
            /> */}

          </>
        ) : (
          <p className="col-span-full text-center text-red-600 text-2xl">Failed to load stats.</p>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
        <div className="p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900">
            Attendance Logs - {stats?.currentShift || "All"} Shift
          </h3>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600"></div>
            <p className="mt-4 text-gray-600 text-lg">Loading logs...</p>
          </div>
        ) : latest50Logs.length === 0 ? (
          <div className="p-16 text-center text-gray-500 text-xl">No records found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">ID</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Name</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Time</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Event</th>
                  <th className="px-8 py-4 text-left text-xs font-bold text-gray-700 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {latest50Logs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition">
                    <td className="px-8 py-4 text-sm font-medium text-gray-900">{log.id}</td>
                    <td className="px-8 py-4 text-sm text-gray-900">
                      {log.name === "N/A" ? "Unknown" : log.name}
                    </td>
                    <td className="px-8 py-4 text-sm text-gray-600">
                      {log.checkInTime || "-"}
                    </td>
                    <td className="px-8 py-4 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium text-green-800">
                        Check_In
                      </span>
                    </td>
                    <td className="px-8 py-4 text-sm">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[log.status] || "bg-gray-100 text-gray-800"
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