import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";
import { Employee, Project } from "../types";
import { format, getDay } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
  handleExportToExcel: propHandleExport, // rename to avoid conflict
  saving,
  fetching,
}: ShiftTableProps) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  const userJson = sessionStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSTL = currentUser?.role === "stl";
  const isReadOnly = isSTL;

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case "A": return { bg: "FFF9C4", border: "FDD835" }; // yellow-100 / yellow-300
      case "B": return { bg: "DBEAFE", border: "93C5FD" }; // blue-100 / blue-300
      case "C": return { bg: "D1FAE5", border: "6EE7B7" }; // green-100 / green-300
      case "RD": return { bg: "FED7AA", border: "FB923C" }; // orange-100 / orange-300
      default: return { bg: "FFFFFF", border: "D1D5DB" }; // white / gray-300
    }
  };

  const getDateForDay = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    return {
      fullDate: format(date, "EEEE, MMMM d, yyyy"),
      weekday: format(date, "EEE"),
      isWeekend: getDay(date) === 0 || getDay(date) === 6,
    };
  };

  // Custom export function with full color support
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Shift Schedule");

    // Title
    worksheet.mergeCells("A1:" + String.fromCharCode(65 + daysInMonth) + "1");
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${selectedProject.name} - ${months[selectedMonth]} ${selectedYear} Shift Schedule`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Header row: Employee + Days
    const headerRow = worksheet.addRow([
      "Employee",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFE5E7EB" }, // gray-100
    };
    headerRow.eachCell((cell, colNumber) => {
      if (colNumber > 1) {
        const day = colNumber - 1;
        const { isWeekend } = getDateForDay(day);
        if (isWeekend) {
          cell.font = { bold: true, color: { argb: "DC2626" } }; // red-600
        }
      }
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thick" },
        right: { style: "thin" },
      };
    });

    // Employee rows
    const filteredEmployees = employees.filter((e) =>
      (selectedProject.employees as any).includes(e.id)
    );

    filteredEmployees.forEach((employee, idx) => {
      const row = worksheet.addRow([
        `${employee.name}\n(${employee.id})`,
        ...Array.from({ length: daysInMonth }, (_, i) => {
          const day = (i + 1).toString();
          return currentAssignments[employee.id]?.[day] || "";
        }),
      ]);

      // Style employee name cell
      const nameCell = row.getCell(1);
      nameCell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      nameCell.font = { bold: true };
      nameCell.border = {
        top: { style: "thin" },
        left: { style: "thick" },
        bottom: { style: "thin" },
        right: { style: "thick" },
      };

      // Style shift cells
      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) return;

        const shift = cell.value as string;
        const colors = getShiftColor(shift);

        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: "FF" + colors.bg },
        };
        cell.border = {
          top: { style: "thin", color: { argb: "FF" + colors.border } },
          left: { style: "thin", color: { argb: "FF" + colors.border } },
          bottom: { style: "thin", color: { argb: "FF" + colors.border } },
          right: { style: "thin", color: { argb: "FF" + colors.border } },
        };
        cell.font = { bold: true, color: { argb: shift === "" ? "FF6B7280" : "FF1F2937" } };
        cell.alignment = { horizontal: "center", vertical: "middle" };
        cell.value = shift || "-";
      });

      row.height = 40;
    });

    // Column widths
    worksheet.getColumn(1).width = 25;
    for (let i = 2; i <= daysInMonth + 1; i++) {
      worksheet.getColumn(i).width = 8;
    }

    // Legend at bottom
    const legendStartRow = worksheet.rowCount + 3;
    worksheet.mergeCells(`A${legendStartRow}:B${legendStartRow}`);
    worksheet.getCell(`A${legendStartRow}`).value = "Legend:";
    worksheet.getCell(`A${legendStartRow}`).font = { bold: true };

    const legends = [
      { shift: "A", label: "Morning Shift (5:30 AM - 1:30 PM)" },
      { shift: "B", label: "Noon Shift (1:30 PM - 9:30 PM)" },
      { shift: "C", label: "Night Shift (9:30 PM - 5:30 AM)" },
      { shift: "RD", label: "Rest Day" },
    ];

    legends.forEach((item, index) => {
      const row = worksheet.addRow([item.shift, item.label]);
      const color = getShiftColor(item.shift);
      row.getCell(1).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF" + color.bg },
      };
      row.getCell(1).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
      row.getCell(1).font = { bold: true };
    });

    // Generate and download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${selectedProject.name.replace(/[^a-z0-9]/gi, '_')}_${months[selectedMonth]}_${selectedYear}_Shifts.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 relative">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{selectedProject.name}</h3>
          <p className="text-sm text-gray-600">
            {months[selectedMonth]} {selectedYear} - Shift Schedule
            {isSTL && <span className="ml-3 text-xs font-medium text-orange-600">(View Only - STL)</span>}
          </p>
        </div>
        <div className="flex space-x-2">
          {!isReadOnly && (
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
          )}

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
        <div className="absolute inset-0 bg-white bg-opacity-70 flex items-center justify-center z-50 rounded-xl">
          <div className="text-gray-600">Loading shifts…</div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto max-w-[1600px]">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b-2 border-r-2 border-gray-300">
                Employee
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                const { fullDate, isWeekend } = getDateForDay(day);
                return (
                  <th
                    key={day}
                    className="relative px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-300 min-w-[60px] group"
                  >
                    <span className={isWeekend ? "text-red-600 font-bold" : ""}>
                      {day}
                    </span>
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                      {fullDate}
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees
              .filter((e) => (selectedProject.employees as any).includes(e.id))
              .map((employee, idx) => (
                <tr
                  key={employee.id}
                  className={`${idx % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-blue-50 transition-colors`}
                >
                  <td className="sticky left-0 z-10 bg-inherit px-4 py-3 text-sm font-medium text-gray-900 border-b border-r-2 border-gray-300">
                    <div>
                      <p className="font-medium">{employee.name}</p>
                      <p className="text-xs text-gray-500">{employee.id}</p>
                    </div>
                  </td>
                  {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
                    const dayStr = day.toString();
                    const currentValue = currentAssignments[employee.id]?.[dayStr] || "";
                    const { fullDate, isWeekend } = getDateForDay(day);
                    const tailwindColor = (() => {
                      switch (currentValue) {
                        case "A": return "bg-yellow-100 border-yellow-300";
                        case "B": return "bg-blue-100 border-blue-300";
                        case "C": return "bg-green-100 border-green-300";
                        case "RD": return "bg-orange-100 border-orange-300";
                        default: return "bg-white border-gray-300";
                      }
                    })();

                    return (
                      <td
                        key={day}
                        className={`px-1 py-1 text-center border-b border-r ${tailwindColor} group relative`}
                      >
                        {isReadOnly ? (
                          <div className={`w-full h-full px-1 py-1.5 text-sm font-bold rounded ${tailwindColor}`}>
                            {currentValue || "-"}
                          </div>
                        ) : (
                          <select
                            value={currentValue}
                            onChange={(e) => handleCellChange(employee.id, dayStr, e.target.value)}
                            className={`w-full h-full px-1 py-1.5 text-sm font-semibold text-center border-0 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer ${tailwindColor}`}
                          >
                            <option value="">-</option>
                            <option value="A">A</option>
                            <option value="B">B</option>
                            <option value="C">C</option>
                            <option value="RD">RD</option>
                          </select>
                        )}

                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          <div className={isWeekend ? "text-red-300" : ""}>{fullDate}</div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                        </div>
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
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-yellow-100 border-2 border-yellow-300 rounded"></div>
            <span>A - Morning Shift (5:30 AM - 1:30 PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 border-2 border-blue-300 rounded"></div>
            <span>B - Noon Shift (1:30 PM - 9:30 PM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-100 border-2 border-green-300 rounded"></div>
            <span>C - Night Shift (9:30 PM - 5:30 AM)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 border-2 border-orange-300 rounded"></div>
            <span>RD - Rest Day</span>
          </div>
        </div>
      </div>
    </div>
  );
};