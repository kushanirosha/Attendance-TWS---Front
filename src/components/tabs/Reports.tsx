import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { Employee } from "../../types";
import { fetchEmployees } from "../../services/employeeService";
import { fetchAttendanceReports } from "../../services/reportService";

export const Reports = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth(); // 0-based
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [searching, setSearching] = useState(false);
  const [reports, setReports] = useState<
    { employee: Employee; data: any }[]
  >([]);

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

  const toggleEmployee = (id: string) => {
    setSelectedEmployeeIds((prev) =>
      prev.includes(id) ? prev.filter((e) => e !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedEmployeeIds.length === filteredEmployees.length) {
      setSelectedEmployeeIds([]);
    } else {
      setSelectedEmployeeIds(filteredEmployees.map((e) => e.id));
    }
  };

  const handleSearch = async () => {
    if (selectedEmployeeIds.length === 0) {
      alert("Please select at least one employee.");
      return;
    }

    setSearching(true);
    setReports([]);

    try {
      const reportsData = await fetchAttendanceReports(
        selectedEmployeeIds,
        selectedYear,
        selectedMonth + 1
      );

      const enrichedReports = reportsData.map((report) => {
        const employee = employees.find((e) => e.id === report.employeeId) || {
          id: report.employeeId,
          name: "Unknown",
          profileImage: "",
        };
        return {
          employee,
          data: report,
        };
      });

      setReports(enrichedReports);
    } catch (err: any) {
      console.error("Failed to fetch reports:", err);
      alert("Error loading reports: " + err.message);
    } finally {
      setSearching(false);
    }
  };

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Native calculation for days in month
  const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  if (loadingEmployees)
    return <div className="text-center text-gray-600 py-10">Loading employees...</div>;
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Reports</h2>

      {/* Filters Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Employee/s ({selectedEmployeeIds.length} selected)
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
                      type="checkbox"
                      checked={selectedEmployeeIds.includes(emp.id)}
                      onChange={() => toggleEmployee(emp.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                      <p className="text-xs text-gray-500">{emp.id}</p>
                    </div>
                  </label>
                ))
              )}
            </div>

            <button
              onClick={handleSelectAll}
              className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              {selectedEmployeeIds.length === filteredEmployees.length && filteredEmployees.length > 0
                ? "Deselect All"
                : "Select All"}
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[2024, 2025, 2026].map((y) => (
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
            disabled={searching || selectedEmployeeIds.length === 0}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SearchIcon className="w-5 h-5" />
            <span className="font-medium">
              {searching ? "Loading Reports…" : "Generate Report"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {searching && (
        <div className="space-y-8">
          {selectedEmployeeIds.map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-md border border-gray-100 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-48 mb-8"></div>
              <div className="overflow-x-auto">
                <div className="h-96 bg-gray-100 rounded"></div>
              </div>
              <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-8 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results */}
      {!searching && reports.length > 0 && (
        <div className="space-y-8">
          {reports.map(({ employee, data }) => (
            <div key={employee.id} className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900">
                  {employee.name} <span className="text-gray-600">({employee.id})</span>
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {months[selectedMonth]} {selectedYear} - Attendance Report
                </p>
              </div>

              <div className="overflow-x-auto max-w-[1600px]">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-10 bg-gray-50 px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b-2 border-r-2 border-gray-300">
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
                      { label: "Status", key: "status" },
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
                          const value = data.attendance[dayStr]?.[key] || "-";
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
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 text-sm">
                  <div>
                    <span className="font-semibold text-gray-700">Total Assigned Days:</span>
                    <span className="ml-2 text-gray-900">{data.summaries.assigned}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Total Working Days:</span>
                    <span className="ml-2 text-gray-900">{data.summaries.working}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Total RD:</span>
                    <span className="ml-2 text-orange-600 font-medium">{data.summaries.rd}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Total Absent:</span>
                    <span className="ml-2 text-red-600 font-medium">{data.summaries.absent}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-gray-700">Total Late:</span>
                    <span className="ml-2 text-amber-600 font-medium">{data.summaries.late}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searching && reports.length === 0 && selectedEmployeeIds.length > 0 && (
        <div className="text-center py-12 text-gray-500">
          Click "Generate Report" to view attendance details.
        </div>
      )}
    </div>
  );
};