import { motion } from "framer-motion";
import { Download, Save, ChevronDown } from "lucide-react";
import { Employee, Project } from "../types/index";

interface STLShiftTableProps {
  selectedProject: Project;
  selectedMonth: number;
  selectedYear: number;
  employees: Employee[];
  daysInMonth: number;
  currentAssignments: { [employeeId: string]: { [day: string]: string } };
  handleCellChange: (employeeId: string, day: string, value: string) => void;
  handleSave: () => void;
  handleExportToExcel: () => void;
  saving: boolean;
  fetching: boolean;
}

export const STLShiftTable = ({
  selectedProject,
  selectedMonth,
  selectedYear,
  employees,
  daysInMonth,
  currentAssignments,
  handleCellChange,
  handleSave,
  handleExportToExcel,
  saving,
  fetching,
}: STLShiftTableProps) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  // Parse stored value: "08:30-20:30" or "RD" or "09:00-" or "-18:00"
  const parseValue = (val: string): { start: string; end: string; isRD: boolean } => {
    if (val === "RD") return { start: "", end: "", isRD: true };
    if (!val || val === "-") return { start: "", end: "", isRD: false };
    const [start, end] = val.split("-");
    return { start: start || "", end: end || "", isRD: false };
  };

  const getCellClass = (value: string) => {
    return value === "RD"
      ? "bg-orange-100 border-orange-300"
      : "bg-white border-gray-300";
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative max-w-[1600px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{selectedProject.name}</h3>
          <p className="text-sm text-gray-600">
            {months[selectedMonth]} {selectedYear} - STL Shift Schedule
          </p>
        </div>
        <div className="flex space-x-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            disabled={saving || fetching}
            className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Saving…" : "Save"}</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleExportToExcel}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export</span>
          </motion.button>
        </div>
      </div>

      {/* Loading Overlay */}
      {fetching && (
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-10">
          <div className="text-gray-600">Loading shifts…</div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="max-w-screen-sm border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b-2 border-r-2 border-gray-300">
                Employee
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <th
                  key={day}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-300 min-w-[160px]"
                >
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees
              .filter((e) => (selectedProject.employees as any).includes(e.id))
              .map((employee, idx) => (
                <tr
                  key={employee.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    } hover:bg-blue-50 transition-colors`}
                >
                  <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium text-gray-900 border-b border-r-2 border-gray-300 bg-inherit">
                    <div className="flex items-center space-x-2">
                      {/* <img
                        src={
                          employee.profileImage
                            ? `http://localhost:3000/uploads/employees/${employee.profileImage}`
                            : "https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg"
                        }
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg";
                        }}
                      /> */}
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.id}</p>
                      </div>
                    </div>
                  </td>

                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayStr = day.toString();
                    const rawValue = currentAssignments[employee.id]?.[dayStr] || "";
                    const { start, end, isRD } = parseValue(rawValue);

                    return (
                      <td
                        key={day}
                        className={`px-2 py-2 text-center border-b border-r border-gray-300 ${getCellClass(
                          rawValue
                        )}`}
                      >
                        {/* === REST DAY (RD) === */}
                        {isRD ? (
                          <div className="relative">
                            <select
                              value="RD"
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === "RD") {
                                  handleCellChange(employee.id, dayStr, "RD");
                                } else {
                                  handleCellChange(employee.id, dayStr, "");
                                }
                              }}
                              className="w-full px-3 py-1.5 text-sm font-bold text-orange-700 bg-orange-100 border border-orange-300 rounded appearance-none cursor-pointer pr-8 focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="RD">RD</option>
                              <option value="">Work</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-orange-700 pointer-events-none" />
                          </div>
                        ) : (
                          /* === WORK DAY: Start & End Time === */
                          <div className="flex items-center justify-center space-x-1">
                            <input
                              type="time"
                              value={start}
                              onChange={(e) => {
                                const newStart = e.target.value;
                                const newEnd = end || "";
                                const newVal = newStart && newEnd ? `${newStart}-${newEnd}` : newStart || newEnd || "";
                                handleCellChange(employee.id, dayStr, newVal);
                              }}
                              className="w-20 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <span className="text-gray-500 text-xs">→</span>
                            <input
                              type="time"
                              value={end}
                              onChange={(e) => {
                                const newEnd = e.target.value;
                                const newStart = start || "";
                                const newVal = newStart && newEnd ? `${newStart}-${newEnd}` : newEnd || newStart || "";
                                handleCellChange(employee.id, dayStr, newVal);
                              }}
                              className="w-20 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            {/* Dropdown to switch to RD */}
                            <div className="relative ml-1">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value === "RD") {
                                    handleCellChange(employee.id, dayStr, "RD");
                                  }
                                }}
                                className="w-8 h-8 p-0 text-xs bg-transparent border-0 cursor-pointer appearance-none"
                              >
                                <option value="">▼</option>
                                <option value="RD">RD</option>
                              </select>
                              {/* <ChevronDown className="absolute right-1 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-500 pointer-events-none" /> */}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-100 border-2 border-orange-300 rounded"></div>
            <span className="text-gray-700">RD - Rest Day</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <span>Edit **Start** and **End** time</span>
            <span className="mx-2">•</span>
            <span>Click down arrow to set RD</span>
          </div>
        </div>
      </div>
    </div>
  );
};