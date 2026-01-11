import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon, Download } from "lucide-react";
import { Employee } from "../../types";
import { fetchEmployees } from "../../services/employeeService";
import { fetchAttendanceReports } from "../../services/reportService";
import * as XLSX from "xlsx"; // Make sure to install: npm install xlsx

export const Reports = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [searching, setSearching] = useState(false);
  const [report, setReport] = useState<{ employee: Employee; data: any } | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoadingEmployees(true);
        const employeeData = await fetchEmployees();
        setEmployees(employeeData);
      } catch (err) {
        console.error("Error loading employees:", err);
        setError("Failed to fetch employees. Please try again later.");
      } finally {
        setLoadingEmployees(false);
      }
    };

    loadData();
  }, []);

  const filteredEmployees = useMemo(() => {
    if (!searchTerm) return employees;
    const lower = searchTerm.toLowerCase();
    return employees.filter(
      (emp) =>
        String(emp.id).toLowerCase().includes(lower) ||
        emp.name.toLowerCase().includes(lower)
    );
  }, [employees, searchTerm]);

  const handleSearch = async () => {
    if (!selectedEmployeeId) {
      alert("Please select an employee.");
      return;
    }

    setSearching(true);
    setReport(null);

    try {
      const reportsData = await fetchAttendanceReports(
        [selectedEmployeeId],
        selectedYear,
        selectedMonth + 1
      );

      if (reportsData.length > 0) {
        const reportData = reportsData[0];
        const employee = employees.find((e) => e.id === reportData.employeeId) || {
          id: reportData.employeeId,
          name: "Unknown",
          profileImage: "",
          project: reportData.project || "Not assigned", // fallback
        };

        setReport({
          employee,
          data: reportData,
        });
      }
    } catch (err: any) {
      console.error("Failed to fetch report:", err);
      alert("Error loading report: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const exportToExcel = () => {
    if (!report) return;

    const { data, employee } = report;
    const monthName = new Date(selectedYear, selectedMonth).toLocaleString("default", { month: "long" });

    const headers = ["Category", ...Array.from({ length: data.meta.daysInMonth }, (_, i) => i + 1)];

    const rows = [
      ["Employee", employee.name, `(${employee.id})`, `Project: ${employee.project || data.project || "-"}`],
      ["Month", `${monthName} ${selectedYear}`],
      [],
      headers,
      ["Shift", ...Object.values(data.attendance).map((d: any) => d.shift || "-")],
      ["Check In", ...Object.values(data.attendance).map((d: any) => d.checkIn || "-")],
      ["Check Out", ...Object.values(data.attendance).map((d: any) => d.checkOut || "-")],
      ["Check In Status", ...Object.values(data.attendance).map((d: any) => d.checkInStatus || "-")],
      ["Check Out Status", ...Object.values(data.attendance).map((d: any) => d.checkOutStatus || "-")],
      ["Remark", ...Object.values(data.attendance).map((d: any) => d.remark || "-")],
      ["Working Hours", ...Object.values(data.attendance).map((d: any) => d.working || "-")],
      [],
      ["Summary"],
      ["Total Assigned Days", data.summaries.assigned],
      ["Total Working Days", data.summaries.working],
      ["Total Rest Days (RD)", data.summaries.rd],
      ["Total Absent", data.summaries.absent],
      ["Total Late", data.summaries.late],
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Auto-size columns (optional)
    ws["!cols"] = headers.map(() => ({ wch: 12 }));

    XLSX.writeFile(wb, `${employee.name}_Attendance_${monthName}_${selectedYear}.xlsx`);
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loadingEmployees) return <div className="text-center text-gray-600 py-10">Loading employees...</div>;
  if (error) return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="space-y-6 max-w-[1600px]">
      <h2 className="text-2xl font-bold text-gray-900">Attendance Reports</h2>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee
            </label>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by ID or Name..."
              className="w-full mb-3 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />

            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50">
              {filteredEmployees.length === 0 ? (
                <p className="text-center text-gray-500 py-4 text-sm">No employees found</p>
              ) : (
                filteredEmployees.map((emp) => (
                  <label
                    key={emp.id}
                    className="flex items-center space-x-3 px-4 py-2 hover:bg-gray-100 cursor-pointer transition-colors"
                  >
                    <input
                      type="radio"
                      name="employee"
                      checked={selectedEmployeeId === emp.id}
                      onChange={() => setSelectedEmployeeId(emp.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.id}</p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026, 2027].map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {months.map((m, idx) => (
                  <option key={idx} value={idx}>{m}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSearch}
            disabled={searching || !selectedEmployeeId}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SearchIcon className="w-5 h-5" />
            <span className="font-medium">
              {searching ? "Loading Report…" : "Generate Report"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Report */}
      {searching && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
          <div className="h-96 bg-gray-100 rounded"></div>
        </div>
      )}

      {!searching && report && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 flex justify-between items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {report.employee.name} <span className="text-gray-600">({report.employee.id})</span>
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Project: <span className="font-medium text-gray-800">{report.data.project || report.employee.project || "Not assigned"}</span>
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {months[selectedMonth]} {selectedYear} - Attendance Report
              </p>
            </div>

            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow transition-colors"
            >
              <Download size={18} />
              <span>Export Excel</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b-2 border-r-2 border-gray-300 min-w-[140px]">
                    Category
                  </th>
                  {daysArray.map((day) => (
                    <th
                      key={day}
                      className="px-3 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-300 min-w-[80px]"
                    >
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "Shift", key: "shift" },
                  { label: "Check In", key: "checkIn" },
                  { label: "Check Out", key: "checkOut" },
                  { label: "Check In Status", key: "checkInStatus" },
                  { label: "Check Out Status", key: "checkOutStatus" },
                  { label: "Remark", key: "remark" },
                  { label: "Working Hours", key: "working" },
                ].map(({ label, key }, rowIdx) => (
                  <tr
                    key={label}
                    className={`${rowIdx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                  >
                    <td className="sticky left-0 z-10 bg-inherit px-6 py-4 text-sm font-medium text-gray-900 border-b border-r-2 border-gray-300">
                      {label}
                    </td>
                    {daysArray.map((day) => {
                      const dayStr = day.toString();
                      const value = report.data.attendance[dayStr]?.[key] ?? "-";
                      return (
                        <td
                          key={day}
                          className="px-3 py-4 text-center text-sm border-b border-r border-gray-300"
                        >
                          {value}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-sm">
              <div>
                <span className="font-semibold text-gray-700">Total Assigned Days:</span>
                <span className="ml-2 text-gray-900">{report.data.summaries.assigned}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Working Days:</span>
                <span className="ml-2 text-gray-900">{report.data.summaries.working}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total RD:</span>
                <span className="ml-2 text-orange-600 font-medium">{report.data.summaries.rd}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Absent:</span>
                <span className="ml-2 text-red-600 font-medium">{report.data.summaries.absent}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">Total Late:</span>
                <span className="ml-2 text-amber-600 font-medium">{report.data.summaries.late}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {!searching && !report && selectedEmployeeId && (
        <div className="text-center py-12 text-gray-500">
          Click "Generate Report" to view attendance details.
        </div>
      )}
    </div>
  );
};