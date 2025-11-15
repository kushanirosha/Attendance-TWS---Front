import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";
import { Employee, Project } from "../types";

interface ShiftTableProps {
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

export const ShiftTable = ({
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
}: ShiftTableProps) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "A": return "bg-yellow-100 border-yellow-300";
      case "B": return "bg-blue-100 border-blue-300";
      case "C": return "bg-green-100 border-green-300";
      case "RD": return "bg-orange-100 border-orange-300";
      default: return "bg-white border-gray-300";
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{selectedProject.name}</h3>
          <p className="text-sm text-gray-600">
            {months[selectedMonth]} {selectedYear} - Shift Schedule
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
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b-2 border-r-2 border-gray-300">
                Employee
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => (
                <th
                  key={day}
                  className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-300 min-w-[60px]"
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
                      <img
                        src={
                          employee.profileImage
                            ? `http://localhost:3000/uploads/employees/${employee.profileImage}`
                            : 'https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg'
                        }
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg';
                        }}
                      />
                      <div>
                        <p className="font-medium">{employee.name}</p>
                        <p className="text-xs text-gray-500">{employee.id}</p>
                      </div>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(
                    (day) => {
                      const dayStr = day.toString();
                      const currentValue =
                        currentAssignments[employee.id]?.[dayStr] || "";
                      return (
                        <td
                          key={day}
                          className={`px-1 py-1 text-center border-b border-r border-gray-300 ${getShiftColor(
                            currentValue
                          )}`}
                        >
                          <select
                            value={currentValue}
                            onChange={(e) =>
                              handleCellChange(
                                employee.id,
                                dayStr,
                                e.target.value
                              )
                            }
                            className={`w-full px-1 py-1.5 text-sm font-semibold text-center border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getShiftColor(
                              currentValue
                            )}`}
                          >
                            <option value="">-</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="RD">RD</option>
                          </select>
                        </td>
                      );
                    }
                  )}
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="p-4 bg-gray-50 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span className="text-gray-700">A - Morning Shift (5:30 AM - 1:30 PM)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span className="text-gray-700">B - Noon Shift (1:30 PM - 9:30 PM)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
            <span className="text-gray-700">C - Night Shift (9:30 PM - 5:30 AM)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-orange-100 border-2 border-orange-300 rounded"></div>
            <span className="text-gray-700">RD - Rest Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};