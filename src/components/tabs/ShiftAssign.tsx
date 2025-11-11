import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, Save } from "lucide-react";
import { Employee, Project } from "../../types";
import {
  getCurrentMonthYear,
  getDaysInMonth,
  getMonthYearKey,
} from "../../utils/dateUtils";
import * as XLSX from "xlsx";
import { ShiftTable } from "./ShiftTable";
import { fetchProjects } from "../../services/projectService";
import { fetchEmployees } from "../../services/employeeService";
import {
  fetchShiftAssignments,
  saveShiftAssignments,
} from "../../services/shiftAssignmentsService";

export const ShiftAssign = () => {
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

  const [assignments, setAssignments] = useState<{
    [employeeId: string]: { [day: string]: string };
  }>({});
  const [saving, setSaving] = useState(false);
  const [fetching, setFetching] = useState(false);

  /* ------------------- Load Projects & Employees ------------------- */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [projectData, employeeData] = await Promise.all([
          fetchProjects(),
          fetchEmployees(),
        ]);

        const fixedProjects = projectData.map((p: any) => ({
          ...p,
          employees:
            typeof p.employees === "string"
              ? JSON.parse(p.employees)
              : Array.isArray(p.employees)
                ? p.employees
                : [],
        }));

        setProjects(fixedProjects);
        setEmployees(employeeData);
      } catch (err) {
        console.error("Error loading data:", err);
        setError("Failed to fetch data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  /* ------------------- Load Assignments from API ------------------- */
  const yearMonthKey = getMonthYearKey(selectedYear, selectedMonth);

  const loadAssignments = useCallback(async () => {
    if (!selectedProject) {
      setAssignments({});
      return;
    }
    setFetching(true);
    try {
      const data = await fetchShiftAssignments(selectedProject.id, yearMonthKey);
      setAssignments(data.assignments ?? {});
    } catch (e) {
      console.error("Failed to load assignments:", e);
      setAssignments({});
    } finally {
      setFetching(false);
    }
  }, [selectedProject, yearMonthKey]);

  useEffect(() => {
    loadAssignments();
  }, [loadAssignments]);

  /* ------------------- Cell Change (Optimistic UI) ------------------- */
  const handleCellChange = (
    employeeId: string,
    day: string,
    value: string
  ) => {
    setAssignments((prev) => ({
      ...prev,
      [employeeId]: {
        ...(prev[employeeId] || {}),
        [day]: value,
      },
    }));
  };

  /* ------------------- Save (Create / Update) ------------------- */
  const handleSave = async () => {
    if (!selectedProject) return;
    setSaving(true);
    try {
      const result = await saveShiftAssignments({
        projectId: selectedProject.id,
        monthYear: yearMonthKey,
        assignments,
      });

      const action = result.inserted ? "created" : "updated";
      alert(`Shift schedule ${action} successfully!`);
    } catch (e: any) {
      console.error(e);
      alert(
        "Failed to save: " +
        (e?.response?.data?.message || e.message)
      );
    } finally {
      setSaving(false);
    }
  };

  /* ------------------- Export to Excel ------------------- */
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
        const assignment = assignments[emp.id]?.[day.toString()] || "-";
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

  /* ------------------- UI Helpers ------------------- */
  const departmentProjects = projects.filter((p) => {
    if (selectedDepartment === "IT") return p.department === "IT Department";
    if (selectedDepartment === "Data Entry")
      return p.department === "Data Entry Department";
    if (selectedDepartment === "Administration")
      return p.department === "Administration Department";
    return false;
  });

  const daysInMonth = getDaysInMonth(selectedYear, selectedMonth);
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];

  if (loading)
    return (
      <div className="text-center text-gray-600 py-10">Loading data...</div>
    );
  if (error)
    return <div className="text-center text-red-500 py-10">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Shift Assignment</h2>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => {
                setSelectedDepartment(
                  e.target.value as "IT" | "Data Entry" | "Administration"
                );
                setSelectedProject(null);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="IT">IT Department</option>
              <option value="Data Entry">Data Entry Department</option>
              {/* <option value="Administration">Administration Department</option> */}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Year
            </label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {[2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Month
            </label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {months.map((m, idx) => (
                <option key={idx} value={idx}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Project Cards */}
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
                  : Array.isArray(project.employees)
                    ? project.employees
                    : [];

              const projectEmployees = employees.filter((e) =>
                empIds.includes(e.id)
              );

              return (
                <motion.div
                  key={project.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setSelectedProject(project)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedProject?.id === project.id
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
                            emp.profileImage
                              ? `http://localhost:3000/uploads/employees/${emp.profileImage}`
                              : "https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg"
                          }
                          alt={emp.name}
                          title={emp.name}
                          className="w-10 h-10 rounded-full border-2 border-white shadow-md object-cover"
                          onError={(e) => {
                            e.currentTarget.src = "https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg";
                          }}
                        />
                      ))
                    ) : (
                      <p className="text-gray-400 text-sm">No matching employees</p>
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Shift Table */}
      {selectedProject && (
        <ShiftTable
          selectedProject={selectedProject}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          employees={employees}
          daysInMonth={daysInMonth}
          currentAssignments={assignments}
          handleCellChange={handleCellChange}
          handleSave={handleSave}
          handleExportToExcel={handleExportToExcel}
          saving={saving}
          fetching={fetching}
        />
      )}
    </div>
  );
};