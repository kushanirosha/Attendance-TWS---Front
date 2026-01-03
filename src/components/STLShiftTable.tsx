import { motion } from "framer-motion";
import { Download, Save, ChevronDown } from "lucide-react";
import { Employee, Project } from "../types/index";
import { format, getDay } from "date-fns";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

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
    if (!val || val === "-" || val === "") return { start: "", end: "", isRD: false };
    const [start, end] = val.split("-");
    return { start: start?.trim() || "", end: end?.trim() || "", isRD: false };
  };

  const getCellClass = (value: string) => {
    return value === "RD"
      ? "bg-orange-100 border-orange-300"
      : "bg-white border-gray-300";
  };

  // Date tooltip helper
  const getDateForDay = (day: number) => {
    const date = new Date(selectedYear, selectedMonth, day);
    return {
      fullDate: format(date, "EEEE, MMMM d, yyyy"),
      isWeekend: getDay(date) === 0 || getDay(date) === 6,
    };
  };

  // Excel Export with colors
  const handleExportToExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("STL Shift Schedule");

    // Title
    worksheet.mergeCells(`A1:${String.fromCharCode(65 + daysInMonth)}1`);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = `${selectedProject.name} - ${months[selectedMonth]} ${selectedYear} STL Shift Schedule`;
    titleCell.font = { size: 16, bold: true };
    titleCell.alignment = { horizontal: "center", vertical: "middle" };

    // Header row
    const headerRow = worksheet.addRow([
      "Employee",
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE5E7EB" } };
    headerRow.eachCell((cell, colNr) => {
      if (colNr > 1) {
        const day = colNr - 1;
        const { isWeekend } = getDateForDay(day);
        if (isWeekend) cell.font = { bold: true, color: { argb: "DC2626" } };
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

    filteredEmployees.forEach((employee) => {
      const rowValues = Array.from({ length: daysInMonth }, (_, i) => {
        const day = (i + 1).toString();
        const val = currentAssignments[employee.id]?.[day] || "";
        return val === "RD" ? "RD" : val || "-";
      });

      const row = worksheet.addRow([`${employee.name} (${employee.id})`, ...rowValues]);

      // Name cell
      row.getCell(1).font = { bold: true };
      row.getCell(1).alignment = { vertical: "middle", horizontal: "left", wrapText: true };
      row.getCell(1).border = {
        top: { style: "thin" },
        left: { style: "thick" },
        bottom: { style: "thin" },
        right: { style: "thick" },
      };

      // Shift cells
      row.eachCell((cell, colNr) => {
        if (colNr === 1) return;
        const value = cell.value as string;

        if (value === "RD") {
          cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFED7AA" } };
          cell.font = { bold: true, color: { argb: "FF9A3412" } };
        } else {
          cell.font = { color: { argb: "FF374151" } };
        }

        cell.border = {
          top: { style: "thin", color: { argb: value === "RD" ? "FFFB923C" : "FFD1D5DB" } },
          left: { style: "thin", color: { argb: value === "RD" ? "FFFB923C" : "FFD1D5DB" } },
          bottom: { style: "thin", color: { argb: value === "RD" ? "FFFB923C" : "FFD1D5DB" } },
          right: { style: "thin", color: { argb: value === "RD" ? "FFFB923C" : "FFD1D5DB" } },
        };
        cell.alignment = { horizontal: "center", vertical: "middle" };
      });

      row.height = 45;
    });

    // Column widths
    worksheet.getColumn(1).width = 28;
    for (let i = 2; i <= daysInMonth + 1; i++) {
      worksheet.getColumn(i).width = 18;
    }

    // Legend
    const legendRow = worksheet.rowCount + 3;
    worksheet.mergeCells(`A${legendRow}:C${legendRow}`);
    worksheet.getCell(`A${legendRow}`).value = "Legend:";
    worksheet.getCell(`A${legendRow}`).font = { bold: true };

    worksheet.addRow([]);
    const rdRow = worksheet.addRow(["RD", "Rest Day"]);
    rdRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFED7AA" } };
    rdRow.getCell(1).border = { top: { style: "thin" }, left: { style: "thin" }, bottom: { style: "thin" }, right: { style: "thin" } };
    rdRow.getCell(1).font = { bold: true };

    // Download
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: "application/octet-stream" });
    saveAs(blob, `${selectedProject.name.replace(/[^a-z0-9]/gi, '_')}_STL_${months[selectedMonth]}_${selectedYear}.xlsx`);
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden relative">
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
                    className="relative px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-300 min-w-[160px] group"
                  >
                    <span className={isWeekend ? "text-red-600 font-bold" : ""}>
                      {day}
                    </span>
                    {/* Tooltip */}
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
                    const rawValue = currentAssignments[employee.id]?.[dayStr] || "";
                    const { start, end, isRD } = parseValue(rawValue);
                    const { fullDate, isWeekend } = getDateForDay(day);

                    return (
                      <td
                        key={day}
                        className={`px-2 py-2 text-center border-b border-r ${getCellClass(rawValue)} group relative`}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 text-xs font-medium text-white bg-gray-900 rounded-md opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50 shadow-lg">
                          <div className={isWeekend ? "text-red-300" : ""}>{fullDate}</div>
                          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-8 border-transparent border-t-gray-900"></div>
                        </div>

                        {/* RD Cell */}
                        {isRD ? (
                          <div className="relative">
                            <select
                              value="RD"
                              onChange={(e) => {
                                if (e.target.value === "RD") {
                                  handleCellChange(employee.id, dayStr, "RD");
                                } else {
                                  handleCellChange(employee.id, dayStr, "");
                                }
                              }}
                              className="w-full px-3 py-2 text-sm font-bold text-orange-700 bg-orange-100 border border-orange-300 rounded appearance-none cursor-pointer pr-8 focus:ring-2 focus:ring-orange-500"
                            >
                              <option value="RD">RD</option>
                              <option value="">Work</option>
                            </select>
                            <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-700 pointer-events-none" />
                          </div>
                        ) : (
                          /* Work Day: Time Inputs */
                          <div className="flex items-center justify-center space-x-1">
                            <input
                              type="time"
                              value={start}
                              onChange={(e) => {
                                const newStart = e.target.value;
                                const newVal = newStart && end ? `${newStart}-${end}` : newStart || end || "";
                                handleCellChange(employee.id, dayStr, newVal);
                              }}
                              className="w-20 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="Start"
                            />
                            <span className="text-gray-500 text-xs">→</span>
                            <input
                              type="time"
                              value={end}
                              onChange={(e) => {
                                const newEnd = e.target.value;
                                const newVal = start && newEnd ? `${start}-${newEnd}` : newEnd || start || "";
                                handleCellChange(employee.id, dayStr, newVal);
                              }}
                              className="w-20 px-1 py-1 text-xs border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                              placeholder="End"
                            />
                            {/* Switch to RD */}
                            <div className="relative ml-1">
                              <select
                                value=""
                                onChange={(e) => {
                                  if (e.target.value === "RD") {
                                    handleCellChange(employee.id, dayStr, "RD");
                                  }
                                }}
                                className="w-8 h-8 p-0 text-xs bg-transparent border-0 cursor-pointer appearance-none opacity-70 hover:opacity-100"
                              >
                                <option value="">▼</option>
                                <option value="RD">RD</option>
                              </select>
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
            <span>Edit start/end times directly</span>
            <span className="mx-2">•</span>
            <span>Use dropdown to toggle RD</span>
          </div>
        </div>
      </div>
    </div>
  );
};