import { useState } from 'react';
import { Download, Save } from 'lucide-react';
import { Employee, Project, ShiftAssignments } from '../../types';
import { getCurrentMonthYear, getDaysInMonth, getMonthYearKey } from '../../utils/dateUtils';
import * as XLSX from 'xlsx';
import { motion } from 'framer-motion';

interface ShiftAssignProps {
  employees: Employee[];
  projects: Project[];
  shiftAssignments: ShiftAssignments;
  onUpdateAssignments: (yearMonth: string, assignments: { [employeeId: string]: { [day: string]: string } }) => void;
}

export const ShiftAssign = ({ employees, projects, shiftAssignments, onUpdateAssignments }: ShiftAssignProps) => {
  const [selectedDepartment, setSelectedDepartment] = useState<'IT' | 'Data Entry'>('IT');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const { year: currentYear, month: currentMonth } = getCurrentMonthYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const departmentProjects = projects.filter(p => p.department === selectedDepartment);
  const yearMonthKey = getMonthYearKey(selectedYear, selectedMonth);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const currentAssignments = shiftAssignments[yearMonthKey] || {};

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
  };

  const handleCellChange = (employeeId: string, day: string, value: string) => {
    const updatedAssignments = {
      ...currentAssignments,
      [employeeId]: {
        ...(currentAssignments[employeeId] || {}),
        [day]: value,
      },
    };
    onUpdateAssignments(yearMonthKey, updatedAssignments);
  };

  const handleSave = () => {
    localStorage.setItem('shiftAssignments', JSON.stringify(shiftAssignments));
    alert('Shift assignments saved successfully!');
  };

  const handleExportToExcel = () => {
    if (!selectedProject) return;

    const projectEmployees = employees.filter(e => selectedProject.employees.includes(e.id));
    const data = projectEmployees.map(emp => {
      const row: any = { 'Employee ID': emp.id, 'Employee Name': emp.name };
      for (let day = 1; day <= daysInMonth; day++) {
        const assignment = currentAssignments[emp.id]?.[day.toString()] || '-';
        row[`Day ${day}`] = assignment;
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Shift Schedule');
    XLSX.writeFile(wb, `${selectedProject.name}_${yearMonthKey}_Schedule.xlsx`);
  };

  const getShiftColor = (shift: string) => {
    switch (shift) {
      case 'A': return 'bg-yellow-100 border-yellow-300';
      case 'B': return 'bg-blue-100 border-blue-300';
      case 'C': return 'bg-green-100 border-green-300';
      case 'RD': return 'bg-orange-100 border-orange-300';
      default: return 'bg-white border-gray-300';
    }
  };

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Shift Assignment</h2>

      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value as 'IT' | 'Data Entry');
                setSelectedProject(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="IT">IT Department</option>
              <option value="Data Entry">Data Entry Department</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Year</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>{m}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentProjects.map((project) => {
            const projectEmployees = employees.filter(e => project.employees.includes(e.id));
            return (
              <motion.div
                key={project.id}
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleProjectClick(project)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  selectedProject?.id === project.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                }`}
              >
                <h3 className="font-bold text-lg mb-3 text-gray-900">{project.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {projectEmployees.map(emp => (
                    <img
                      key={emp.id}
                      src={emp.profileImage || 'https://via.placeholder.com/40'}
                      alt={emp.name}
                      title={emp.name}
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                    />
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {selectedProject && (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
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
                className="flex items-center space-x-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg shadow-md transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save</span>
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

          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="overflow-hidden">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="sticky left-0 z-10 bg-gray-50 px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase border-b-2 border-r-2 border-gray-300">
                        Employee
                      </th>
                      {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                        <th key={day} className="px-2 py-3 text-center text-xs font-semibold text-gray-700 border-b-2 border-r border-gray-300 min-w-[60px]">
                          {day}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {employees
                      .filter(e => selectedProject.employees.includes(e.id))
                      .map((employee, idx) => (
                        <tr
                          key={employee.id}
                          className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}
                        >
                          <td className="sticky left-0 z-10 px-4 py-3 text-sm font-medium text-gray-900 border-b border-r-2 border-gray-300 bg-inherit">
                            <div className="flex items-center space-x-2">
                              <img
                                src={employee.profileImage || 'https://via.placeholder.com/32'}
                                alt={employee.name}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <div>
                                <p className="font-medium">{employee.name}</p>
                                <p className="text-xs text-gray-500">{employee.id}</p>
                              </div>
                            </div>
                          </td>
                          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => {
                            const dayStr = day.toString();
                            const currentValue = currentAssignments[employee.id]?.[dayStr] || '';
                            return (
                              <td
                                key={day}
                                className={`px-1 py-1 text-center border-b border-r border-gray-300 ${getShiftColor(currentValue)}`}
                              >
                                <select
                                  value={currentValue}
                                  onChange={(e) => handleCellChange(employee.id, dayStr, e.target.value)}
                                  className={`w-full px-1 py-1.5 text-sm font-semibold text-center border-0 focus:ring-2 focus:ring-blue-500 cursor-pointer ${getShiftColor(currentValue)}`}
                                >
                                  <option value="">-</option>
                                  <option value="A">A</option>
                                  <option value="B">B</option>
                                  <option value="C">C</option>
                                  <option value="RD">RD</option>
                                </select>
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

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
      )}
    </div>
  );
};
