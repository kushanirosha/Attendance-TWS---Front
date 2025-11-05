import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";
import { Employee, Project, ShiftAssignments } from "../../types";
import {
  getCurrentMonthYear,
  getDaysInMonth,
  getMonthYearKey,
} from "../../utils/dateUtils";
import * as XLSX from "xlsx";
import { ShiftTable } from "./ShiftTable";
import { fetchProjects } from "../../services/projectService";
import { fetchEmployees } from "../../services/employeeService"; // ✅ Import employee service

interface ShiftAssignProps {
  shiftAssignments: ShiftAssignments;
  onUpdateAssignments: (
    yearMonth: string,
    assignments: { [employeeId: string]: { [day: string]: string } }
  ) => void;
}

export const ShiftAssign = ({
  shiftAssignments,
  onUpdateAssignments,
}: ShiftAssignProps) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedDepartment, setSelectedDepartment] = useState<
    "IT" | "Data Entry" | "Administration"
  >("IT");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const { year: currentYear, month: currentMonth } = getCurrentMonthYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  // ✅ Fetch projects and employees
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [projectData, employeeData] = await Promise.all([
          fetchProjects(),
          fetchEmployees(),
        ]);

        // ✅ Fix employees field if it's a string
        const fixedProjects = projectData.map((p: any) => ({
          ...p,
          employees:
            typeof p.employees === "string"
              ? JSON.parse(p.employees)
              : p.employees,
        }));

        console.log("✅ Projects fetched:", fixedProjects);
        console.log("✅ Employees fetched:", employeeData);

        setProjects(fixedProjects);
        setEmployees(employeeData);
      } catch (err) {
        console.error("❌ Error loading data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // ✅ Filter projects by department
  const departmentProjects = projects.filter((p) => {
    if (selectedDepartment === "IT") return p.department === "IT Department";
    if (selectedDepartment === "Data Entry")
      return p.department === "Data Entry Department";
    if (selectedDepartment === "Administration")
      return p.department === "Administration Department";
    return false;
  });

  const yearMonthKey = getMonthYearKey(selectedYear, selectedMonth);
  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const currentAssignments = shiftAssignments[yearMonthKey] || {};

  const handleProjectClick = (project: Project) => setSelectedProject(project);

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
    localStorage.setItem("shiftAssignments", JSON.stringify(shiftAssignments));
    alert("✅ Shift assignments saved successfully!");
  };

  const handleExportToExcel = () => {
    if (!selectedProject) return;

    const empIds =
      typeof selectedProject.employees === "string"
        ? JSON.parse(selectedProject.employees)
        : selectedProject.employees;

    const projectEmployees = employees.filter((e) => empIds.includes(e.id));

    const data = projectEmployees.map((emp) => {
      const row: any = { "Employee ID": emp.id, "Employee Name": emp.name };
      for (let day = 1; day <= daysInMonth; day++) {
        const assignment =
          currentAssignments[emp.id]?.[day.toString()] || "-";
        row[`Day ${day}`] = assignment;
      }
      return row;
    });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Shift Schedule");
    XLSX.writeFile(
      wb,
      `${selectedProject.name}_${yearMonthKey}_Schedule.xlsx`
    );
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  if (loading)
    return (
      <div className="text-center text-gray-600 py-10">
        Loading data...
      </div>
    );
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Shift Assignment</h2>

      {/* Department, Year, Month */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          {/* Department */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(e.target.value as
                  | "IT"
                  | "Data Entry"
                  | "Administration");
                setSelectedProject(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="IT">IT Department</option>
              <option value="Data Entry">Data Entry Department</option>
              <option value="Administration">
                Administration Department
              </option>
            </select>
          </div>

          {/* Year */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ✅ Project List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {departmentProjects.length === 0 ? (
            <p className="text-gray-500 col-span-full text-center">
              No projects found for this department.
            </p>
          ) : (
            departmentProjects.map((project) => {
              const empIds =
                typeof project.employees === "string"
                  ? JSON.parse(project.employees)
                  : project.employees;

              const projectEmployees = employees.filter((e) =>
                empIds.includes(e.id)
              );

              return (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleProjectClick(project)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedProject?.id === project.id
                      ? "border-blue-500 bg-blue-50 shadow-lg"
                      : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-md"
                  }`}
                >
                  <h3 className="font-bold text-lg mb-3 text-gray-900">
                    {project.name}
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {projectEmployees.length > 0 ? (
                      projectEmployees.map((emp) => (
                        <img
                          key={emp.id}
                          src={
                            emp.profileImage || "https://via.placeholder.com/40"
                          }
                          alt={emp.name}
                          title={emp.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                        />
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">
                        No matching employees
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* ✅ Shift Table */}
      {selectedProject && (
        <ShiftTable
          selectedProject={selectedProject}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          employees={employees}
          daysInMonth={daysInMonth}
          currentAssignments={currentAssignments}
          handleCellChange={handleCellChange}
          handleSave={handleSave}
          handleExportToExcel={handleExportToExcel}
        />
      )}
    </div>
  );
};
