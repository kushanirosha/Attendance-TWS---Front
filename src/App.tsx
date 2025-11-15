// App.tsx
import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/tabs/Dashboard';
import { Employees } from './components/tabs/Employees';
import { ShiftAssign } from './components/tabs/ShiftAssign';
import { Users } from './components/tabs/Users';
import { Projects } from './components/tabs/Projects';
import { TabType, DummyData, Employee, ShiftAssignments, Project } from './types';
import { getCurrentMonthYear, getMonthYearKey } from './utils/dateUtils';
import dummyDataJson from './data/dummyData.json';
import { StatCardDetails } from './components/tabs/StatCardDetails';
import { Reports } from './components/tabs/Reports';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DummyData>(dummyDataJson as DummyData);

  useEffect(() => {
    const savedAssignments = localStorage.getItem('shiftAssignments');
    if (savedAssignments) {
      try {
        const parsed = JSON.parse(savedAssignments);
        setData(prev => ({ ...prev, shiftAssignments: parsed }));
      } catch (e) {
        console.error('Failed to parse saved assignments');
      }
    }
  }, []);

  // --- Employee Handlers ---
  const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
    const newId = `EMP${String(data.employees.length + 1).padStart(3, '0')}`;
    const employee: Employee = { ...newEmployee, id: newId };
    setData(prev => ({
      ...prev,
      employees: [...prev.employees, employee],
    }));
  };

  const handleEditEmployee = (id: string, updatedEmployee: Partial<Employee>) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(emp =>
        emp.id === id ? { ...emp, ...updatedEmployee } : emp
      ),
    }));
  };

  // --- Shift Assignment Handlers ---
  const handleUpdateAssignments = (
    yearMonth: string,
    assignments: { [employeeId: string]: { [day: string]: string } }
  ) => {
    setData(prev => ({
      ...prev,
      shiftAssignments: {
        ...prev.shiftAssignments,
        [yearMonth]: assignments,
      },
    }));
  };

  // --- Project Handlers ---
  const handleAddProject = (newProject: Omit<Project, 'id'>) => {
    const newId = `PROJ${String(data.projects.length + 1).padStart(3, '0')}`;
    const project: Project = { ...newProject, id: newId };
    setData(prev => ({
      ...prev,
      projects: [...prev.projects, project],
    }));
  };

  const handleEditProject = (id: string, updatedProject: Partial<Project>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, ...updatedProject } : proj
      ),
    }));
  };

  const handleLogout = () => {
    alert('Logging out...');
  };

  const { year, month } = getCurrentMonthYear();
  const currentMonthKey = getMonthYearKey(year, month);
  const currentMonthAssignments = data.shiftAssignments[currentMonthKey] || {};

  // ← Extract all project IDs
  const allProjectIds = data.projects.map(p => p.id);

  return (
    <div className="min-h-screen bg-gray-100">
      <Header
        userName="Admin User"
        userRole="Administrator"
        onLogout={handleLogout}
      />

      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={isSidebarOpen}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <main className={`pt-20 px-4 md:px-8 pb-8 transition-all duration-300 ${isSidebarOpen ? 'md:pl-72' : 'pl-4'}`}>
        <div className="mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard
              projectIds={allProjectIds}   // ← ALL PROJECTS
              employees={data.employees}
              attendance={data.attendance}
              shiftAssignments={currentMonthAssignments}
            />
          )}
          {activeTab === 'employees' && (
            <Employees
              employees={data.employees}
              onAddEmployee={handleAddEmployee}
              onEditEmployee={handleEditEmployee}
            />
          )}
          {activeTab === 'shiftAssign' && (
            <ShiftAssign
              employees={data.employees}
              projects={data.projects}
              shiftAssignments={data.shiftAssignments}
              onUpdateAssignments={handleUpdateAssignments}
            />
          )}
          {activeTab === 'projects' && (
            <Projects
              projects={data.projects}
              onAddProject={handleAddProject}
              onEditProject={handleEditProject}
            />
          )}

          {activeTab === 'statCardDetails' && <StatCardDetails />}
          {activeTab === 'reports' && <Reports />}

          {activeTab === 'users' && <Users users={data.users} />}

        </div>
      </main>
    </div>
  );
}

export default App;