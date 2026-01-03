import { useEffect, useMemo, useState } from 'react';
import { Plus, Edit, Trash } from 'lucide-react';
import { Modal } from '../Modal';
import { motion } from 'framer-motion';
import { fetchEmployees } from '../../services/employeeService';
import {
  fetchProjects,
  addProject as addProjectAPI,
  updateProject as updateProjectAPI,
  deleteProject as deleteProjectAPI,
  Project
} from '../../services/projectService';

interface Employee {
  id: string;
  name: string;
}

export const Projects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Get current logged-in user from sessionStorage
  const userJson = sessionStorage.getItem("user");
  const currentUser = userJson ? JSON.parse(userJson) : null;
  const isSTL = currentUser?.role === "stl";
  const isReadOnly = isSTL;

  useEffect(() => {
    const loadData = async () => {
      const projData = await fetchProjects();
      const empData = await fetchEmployees();

      const parsedProjects = projData.map((p: any) => ({
        ...p,
        employees: typeof p.employees === 'string'
          ? JSON.parse(p.employees || '[]')
          : Array.isArray(p.employees)
          ? p.employees
          : []
      }));

      setProjects(parsedProjects || []);
      setEmployees(empData || []);
    };

    loadData();
  }, []);

  const handleAddProject = async (project: Omit<Project, 'id'>) => {
    try {
      const saved = await addProjectAPI(project);
      const parsedSaved = {
        ...saved,
        employees: typeof saved.employees === 'string'
          ? JSON.parse(saved.employees || '[]')
          : Array.isArray(saved.employees)
          ? saved.employees
          : []
      };

      setProjects(prev => [...prev, parsedSaved]);
      setIsAddModalOpen(false);
    } catch (err) {
      console.error('Failed to add project', err);
      alert('Error adding project');
    }
  };

  const handleEditProject = async (id: string, updates: Partial<Project>) => {
    try {
      const updated = await updateProjectAPI(id, updates);
      const parsedUpdated = {
        ...updated,
        employees: typeof updated.employees === 'string'
          ? JSON.parse(updated.employees || '[]')
          : Array.isArray(updated.employees)
          ? updated.employees
          : []
      };

      setProjects(prev => prev.map(p => (p.id === id ? parsedUpdated : p)));
      setIsEditModalOpen(false);
      setSelectedProject(null);
    } catch (err) {
      console.error('Failed to update project', err);
      alert('Error updating project');
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (confirm('Are you sure you want to delete this project?')) {
      await deleteProjectAPI(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
          {isSTL && (
            <span className="text-sm font-medium text-orange-600">
              (View Only - STL)
            </span>
          )}
        </div>

        {/* Hide Add Button for STL */}
        {!isReadOnly && (
          <motion.button
            onClick={() => setIsAddModalOpen(true)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md"
          >
            <Plus className="w-5 h-5" />
            <span>Add Project</span>
          </motion.button>
        )}
      </div>

      {/* Projects Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Employees</th>
                {!isReadOnly && (
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {projects.length === 0 ? (
                <tr>
                  <td colSpan={isReadOnly ? 4 : 5} className="px-6 py-8 text-center text-gray-500">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-medium">{p.id}</td>
                    <td className="px-6 py-4 text-sm">{p.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.department}</td>
                    <td className="px-6 py-4 text-sm">
                      {Array.isArray(p.employees) && p.employees.length > 0
                        ? p.employees.join(', ')
                        : '—'}
                    </td>
                    {!isReadOnly && (
                      <td className="px-6 py-4 text-sm flex space-x-4">
                        <motion.button
                          onClick={() => {
                            setSelectedProject(p);
                            setIsEditModalOpen(true);
                          }}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-blue-600 hover:text-blue-800"
                          title="Edit Project"
                        >
                          <Edit className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          onClick={() => handleDeleteProject(p.id)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.95 }}
                          className="text-red-600 hover:text-red-800"
                          title="Delete Project"
                        >
                          <Trash className="w-5 h-5" />
                        </motion.button>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal - Only shown if not STL */}
      {!isReadOnly && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Project">
          <ProjectForm employees={employees} onSubmit={handleAddProject} />
        </Modal>
      )}

      {/* Edit Modal - Only shown if not STL */}
      {!isReadOnly && (
        <Modal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedProject(null);
          }}
          title="Edit Project"
        >
          {selectedProject && (
            <ProjectForm
              project={selectedProject}
              employees={employees}
              onSubmit={(updates) => handleEditProject(selectedProject.id, updates)}
            />
          )}
        </Modal>
      )}
    </div>
  );
};

// ProjectForm remains unchanged
interface ProjectFormProps {
  project?: Project;
  employees: Employee[];
  onSubmit: (project: Omit<Project, 'id'> | Partial<Project>) => void;
}

const ProjectForm = ({ project, employees, onSubmit }: ProjectFormProps) => {
  const [name, setName] = useState(project?.name || '');
  const [department, setDepartment] = useState(project?.department || 'IT Department');
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (project?.employees && Array.isArray(project.employees)) {
      setSelectedEmployees(project.employees.map(String));
    }
  }, [project]);

  const filteredEmployees = useMemo(() => {
    const lower = search.toLowerCase();
    return employees.filter(emp =>
      emp.name.toLowerCase().includes(lower) || emp.id.toLowerCase().includes(lower)
    );
  }, [employees, search]);

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ name, department, employees: selectedEmployees });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          required
          placeholder="Project Name"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
        <select
          value={department}
          onChange={e => setDepartment(e.target.value)}
          required
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          <option value="IT Department">IT Department</option>
          <option value="Data Entry Department">Data Entry Department</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">Assign Employees</label>
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search employees..."
          className="w-full mb-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />

        <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2 bg-gray-50">
          {filteredEmployees.length === 0 ? (
            <p className="text-gray-400 text-sm py-2">No employees found.</p>
          ) : (
            filteredEmployees.map(emp => (
              <label
                key={emp.id}
                className="flex items-center space-x-2 py-2 px-2 rounded hover:bg-gray-100 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{emp.id} - {emp.name}</span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="submit"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          {project ? 'Update' : 'Create'} Project
        </button>
      </div>
    </form>
  );
};