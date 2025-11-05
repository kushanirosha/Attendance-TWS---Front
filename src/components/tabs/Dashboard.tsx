import { useEffect, useState } from "react";
import { Users, CheckCircle, XCircle, Clock, Calendar, LogOut } from "lucide-react";
import { StatCard } from "../StatCard";
import { Employee, Attendance, ShiftType } from "../../types";
import { getCurrentShift } from "../../utils/dateUtils";
import { fetchAttendance } from "../../services/attendanceService";

interface DashboardProps {
  employees: Employee[];
  shiftAssignments: { [employeeId: string]: { [day: string]: string } };
}

export const Dashboard = ({ employees, shiftAssignments }: DashboardProps) => {
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  const currentShift = getCurrentShift();
  const currentDay = new Date().getDate().toString();

  useEffect(() => {
    const loadAttendance = async () => {
      setLoading(true);
      try {
        const data = await fetchAttendance();
        setAttendance(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadAttendance();
  }, []);

  // --- Stats ---
  const presentCount = attendance.filter(a => a.status !== "Absent").length;
  const absentCount = attendance.filter(a => a.status === "Absent").length;
  const lateCount = attendance.filter(a => a.status === "Late").length;
  const earlyCount = attendance.filter(a => a.status === "Early Punchout").length; // new stat
  const rdCount = Object.entries(shiftAssignments).filter(
    ([_, assignments]) => assignments[currentDay] === "RD"
  ).length;

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">
              Current Shift: {currentShift}
            </h2>
            <p className="text-lg font-medium opacity-80">
              {shiftTimings[currentShift]}
            </p>
          </div>
          <Calendar className="w-12 h-12 opacity-60" />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
        <StatCard
          title="Total Employees"
          value={`M: ${employees.filter(e => e.status === "Active" && e.gender === "Male").length} | F: ${employees.filter(e => e.status === "Active" && e.gender === "Female").length}`}
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Present"
          value={`M: ${employees.filter(e => e.attendance === "Present" && e.gender === "Male").length} | F: ${employees.filter(e => e.attendance === "Present" && e.gender === "Female").length}`}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Absent"
          value={`M: ${employees.filter(e => e.attendance === "Absent" && e.gender === "Male").length} | F: ${employees.filter(e => e.attendance === "Absent" && e.gender === "Female").length}`}
          icon={XCircle}
          color="red"
        />
        <StatCard
          title="Late Coming"
          value={`M: ${employees.filter(e => e.attendance === "Late" && e.gender === "Male").length} | F: ${employees.filter(e => e.attendance === "Late" && e.gender === "Female").length}`}
          icon={Clock}
          color="yellow"
        />
        <StatCard
          title="Early Punchouts"
          value={`M: ${employees.filter(e => e.attendance === "Early Punchout" && e.gender === "Male").length} | F: ${employees.filter(e => e.attendance === "Early Punchout" && e.gender === "Female").length}`}
          icon={LogOut}
          color="purple"
        />
        <StatCard
          title="Rest Day (Today)"
          value={`M: ${employees.filter(e => e.attendance === "Rest Day" && e.gender === "Male").length} | F: ${employees.filter(e => e.attendance === "Rest Day" && e.gender === "Female").length}`}
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">
            Attendance - {currentShift} Shift
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-600">
            Loading attendance...
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
                  .map(record => (
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
