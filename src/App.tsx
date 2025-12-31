// src/App.tsx
import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

// Components
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { Login } from './components/auth/Login';

// Tabs
import { Dashboard } from './components/tabs/Dashboard';
import { Employees } from './components/tabs/Employees';
import { ShiftAssign } from './components/tabs/ShiftAssign';
import { Users } from './components/tabs/Users';
import { Projects } from './components/tabs/Projects';
import { StatCardDetails } from './components/tabs/StatCardDetails';
import { Reports } from './components/tabs/Reports';

// Types & Utils
import { TabType, DummyData, Employee, ShiftAssignments, Project } from './types';
import { getCurrentMonthYear, getMonthYearKey } from './utils/dateUtils';
import dummyDataJson from './data/dummyData.json';

// Auth Service
import { authService } from './services/authService';
import { ChristmasEffect } from './components/ChristmasEffect';
import { NewYear2026Effect } from './components/NewYearTicker';

// ──────────────────────────────────────────────────────────────
// Protected Route Component
// ──────────────────────────────────────────────────────────────
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const isLoggedIn = authService.isLoggedIn();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// ──────────────────────────────────────────────────────────────
// Main App Layout (Protected)
// ──────────────────────────────────────────────────────────────
const AppLayout = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [data, setData] = useState<DummyData>(dummyDataJson as DummyData);

  // Load shift assignments from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('shiftAssignments');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(prev => ({ ...prev, shiftAssignments: parsed }));
      } catch (e) {
        console.error('Failed to parse saved assignments');
      }
    }
  }, []);

  // Handlers
  const handleAddEmployee = (newEmployee: Omit<Employee, 'id'>) => {
    const newId = `EMP${String(data.employees.length + 1).padStart(3, '0')}`;
    const employee: Employee = { ...newEmployee, id: newId };
    setData(prev => ({ ...prev, employees: [...prev.employees, employee] }));
  };

  const handleEditEmployee = (id: string, updated: Partial<Employee>) => {
    setData(prev => ({
      ...prev,
      employees: prev.employees.map(emp =>
        emp.id === id ? { ...emp, ...updated } : emp
      ),
    }));
  };

  const handleUpdateAssignments = (
    yearMonth: string,
    assignments: { [employeeId: string]: { [day: string]: string } }
  ) => {
    setData(prev => ({
      ...prev,
      shiftAssignments: { ...prev.shiftAssignments, [yearMonth]: assignments },
    }));
  };

  const handleAddProject = (newProject: Omit<Project, 'id'>) => {
    const newId = `PROJ${String(data.projects.length + 1).padStart(3, '0')}`;
    const project: Project = { ...newProject, id: newId };
    setData(prev => ({ ...prev, projects: [...prev.projects, project] }));
  };

  const handleEditProject = (id: string, updated: Partial<Project>) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(proj =>
        proj.id === id ? { ...proj, ...updated } : proj
      ),
    }));
  };

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
  };

  const { year, month } = getCurrentMonthYear();
  const currentMonthKey = getMonthYearKey(year, month);
  const currentMonthAssignments = data.shiftAssignments[currentMonthKey] || {};
  const allProjectIds = data.projects.map(p => p.id);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header onLogout={handleLogout} />

      {/*<ChristmasEffect />*/}

      <NewYear2026Effect />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          isOpen={isSidebarOpen}
          onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
        />

        <main
          className={`flex-1 pt-20 px-4 md:px-8 pb-20 transition-all duration-300 ${
            isSidebarOpen ? 'md:pl-72' : ''
          }`}
        >
          <div className="">
            {activeTab === 'dashboard' && (
              <Dashboard
                projectIds={allProjectIds}
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

      {/*<Footer />*/}

    </div>
  );
};

// ──────────────────────────────────────────────────────────────
// Root App with Routing
// ──────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;