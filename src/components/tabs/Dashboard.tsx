import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Calendar, LogOut } from "lucide-react";
import { StatCard } from "../StatCard";
import { Attendance, ShiftType } from "../../types";
import { getCurrentShift } from "../../utils/dateUtils";
import { fetchAttendance } from "../../services/attendanceService";
import { fetchEmployeeStats } from "../../services/statCardService";

export const Dashboard = () => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const currentShift = getCurrentShift();

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [attendanceData, statsData] = await Promise.all([
          fetchAttendance(),
          fetchEmployeeStats(),
        ]);
        setAttendance(attendanceData);
        setStats(statsData);
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Shift UI Config
  const shiftColors: Record<ShiftType, string> = {
    Morning: "bg-yellow-100 text-yellow-800 border-yellow-300",
    Noon: "bg-blue-100 text-blue-800 border-blue-300",
    Night: "bg-green-100 text-green-800 border-green-300",
  };

  const shiftTimings: Record<ShiftType, string> = {
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

  return (
    <div className="space-y-6">
      {/* Current Shift Card */}
      <div className={`rounded-xl border-2 p-6 ${shiftColors[currentShift]}`}>
        <div className="flex items-center justify-center">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Current Shift: {currentShift}
            </h2>
            <p className="text-lg font-medium opacity-80 flex items-center justify-center">
              {shiftTimings[currentShift]}
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-gray-200 border-2 border-dashed rounded-xl w-full h-48 animate-pulse"
            />
          ))
        ) : stats ? (
          <>
            <StatCard
              title="Total Employees"
              value={`M: ${stats.totalActive?.male ?? 0} | F: ${stats.totalActive?.female ?? 0}`}
              icon={Users}
              color="blue"
            />
            <StatCard
              title="Present"
              value={`M: ${stats.present?.male ?? 0} | F: ${stats.present?.female ?? 0}`}
              icon={CheckCircle}
              color="green"
            />
            <StatCard
              title="Absent"
              value={`M: ${stats.absent?.male ?? 0} | F: ${stats.absent?.female ?? 0}`}
              icon={XCircle}
              color="red"
            />
            <StatCard
              title="Late Coming"
              value={`M: ${stats.late?.male ?? 0} | F: ${stats.late?.female ?? 0}`}
              icon={Clock}
              color="yellow"
            />
            <StatCard
              title="Early Punchouts"
              value={`M: ${stats.earlyPunchout?.male ?? 0} | F: ${stats.earlyPunchout?.female ?? 0}`}
              icon={LogOut}
              color="purple"
            />
            <StatCard
              title="Rest Day (Today)"
              value={(stats.restDayShift?.today ?? 0).toString()}
              subtitle={stats.restDayShift?.todayFormatted || "No one on RD today"}
              icon={Calendar}
              color="orange"
            />
          </>
        ) : (
          <p className="col-span-full text-center text-red-600">
            Failed to load employee stats.
          </p>
        )}
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Attendance - {currentShift} Shift
          </h3>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading attendance records...</p>
          </div>
        ) : attendance.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            No attendance records found for today.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Employee ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Check-in Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[...attendance]
                  .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                  .map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {record.checkInTime || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusColors[record.status] || "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {record.status}
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