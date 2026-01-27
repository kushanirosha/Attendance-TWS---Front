import { useState, useEffect, useRef } from 'react';
import { Plus, Edit, Search, Trash2 } from 'lucide-react';
import { Employee, Project } from '../../types';
import { Modal } from '../Modal';
import { motion } from 'framer-motion';
import * as employeeService from '../../services/employeeService';
import * as projectService from '../../services/projectService';

export const Employees = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Refs for image preview
  const addImagePreviewRef = useRef<HTMLImageElement>(null);
  const editImagePreviewRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    loadEmployees();
    loadProjects();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const data = await employeeService.fetchEmployees();
      setEmployees(data);
    } catch (err) {
      console.error('Error loading employees', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectService.fetchProjects();
      setProjects(data);
    } catch (err) {
      console.error('Error loading projects', err);
    }
  };

  const handleAddEmployee = async (
    employee: Omit<Employee, 'id'> & { id: string },
    file?: File
  ) => {
    try {
      const newEmp = await employeeService.addEmployee(employee, file);
      setEmployees((prev) => [...prev, newEmp]);
    } catch (err: any) {
      alert(err.message || 'Failed to add employee');
    }
  };

  const handleEditEmployee = async (
    id: string,
    updates: Partial<Employee>,
    file?: File
  ) => {
    try {
      const updated = await employeeService.updateEmployee(id, updates, file);
      setEmployees((prev) => prev.map((emp) => (emp.id === id ? updated : emp)));
    } catch (err: any) {
      alert(err.message || 'Failed to update employee');
    }
  };

  const handleDeleteEmployee = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this employee?')) return;
    try {
      await employeeService.deleteEmployee(id);
      setEmployees((prev) => prev.filter((emp) => emp.id !== id));
    } catch (err) {
      console.error('Delete employee failed', err);
    }
  };

  const filteredEmployees = employees.filter((emp) =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Reset preview on modal close
  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setTimeout(() => {
      if (addImagePreviewRef.current) {
        addImagePreviewRef.current.src = 'https://via.placeholder.com/100';
      }
    }, 0);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedEmployee(null);
    setTimeout(() => {
      if (editImagePreviewRef.current) {
        editImagePreviewRef.current.src = 'https://via.placeholder.com/100';
      }
    }, 0);
  };

  const openEditModal = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsEditModalOpen(true);
    setTimeout(() => {
      if (editImagePreviewRef.current) {
        editImagePreviewRef.current.src =
          employee.profileImageUrl ||
          employee.profileImage ||
          'https://via.placeholder.com/100';
      }
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-gray-900">Employees Management</h2>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg shadow-md transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Add Employee</span>
        </motion.button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search by name, ID, or department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Gender</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Project</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{employee.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <img
                        src={
                          employee.profileImage
                            ? `https://backend.tws.ceyloncreative.online/uploads/employees/${employee.profileImage}`
                            : 'https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg'
                        }
                        alt={employee.name}
                        className="w-10 h-10 rounded-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://icon-library.com/images/person-image-icon/person-image-icon-27.jpg';
                        }}
                      />
                      <span className="text-sm font-medium text-gray-900">{employee.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.gender}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${employee.status === 'Active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                        }`}
                    >
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.department}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{employee.project}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex space-x-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => openEditModal(employee)}
                      className="text-blue-600 hover:text-blue-800 transition-colors"
                    >
                      <Edit className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDeleteEmployee(employee.id)}
                      className="text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </motion.button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={isAddModalOpen} onClose={closeAddModal} title="Add New Employee">
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            const form = e.currentTarget;
            const formData = new FormData(form);
            const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
            const file = fileInput.files?.[0] || undefined;

            const newEmployee = {
              id: formData.get('id') as string,
              name: formData.get('name') as string,
              gender: formData.get('gender') as string,
              status: formData.get('status') as 'Active' | 'Inactive',
              department: formData.get('department') as string,
              project: formData.get('project') as string,
            };

            await handleAddEmployee(newEmployee, file);
            form.reset();
            if (addImagePreviewRef.current) {
              addImagePreviewRef.current.src = 'https://via.placeholder.com/100';
            }
            setIsAddModalOpen(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Employee ID</label>
            <input
              type="text"
              name="id"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
            <input
              type="text"
              name="name"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
            <select
              name="gender"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <select
              name="status"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
            <select
              name="department"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="IT">IT</option>
              <option value="Data Entry">Data Entry</option>
              <option value="Administration">Administration</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
            <select
              name="project"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a project</option>
              <option value="ADMIN">ADMIN</option>
              <option value="ADMIN">New</option>
              {projects.map((proj) => (
                <option key={proj.id} value={proj.name}>
                  {proj.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file && addImagePreviewRef.current) {
                  addImagePreviewRef.current.src = URL.createObjectURL(file);
                }
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <div className="mt-2 flex justify-center">
              <img
                ref={addImagePreviewRef}
                src="https://via.placeholder.com/100"
                alt="Preview"
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={closeAddModal}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
            >
              Add Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Employee Modal */}
      <Modal isOpen={isEditModalOpen} onClose={closeEditModal} title="Edit Employee">
        {selectedEmployee && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const fileInput = form.querySelector('input[type="file"]') as HTMLInputElement;
              const file = fileInput.files?.[0] || undefined;

              const updates: Partial<Employee> = {
                name: formData.get('name') as string,
                gender: formData.get('gender') as string,
                status: formData.get('status') as 'Active' | 'Inactive',
                department: formData.get('department') as string,
                project: formData.get('project') as string,
              };

              await handleEditEmployee(selectedEmployee.id, updates, file);
              closeEditModal();
            }}
            className="space-y-4"
          >
            <div className="flex justify-center mb-4">
              <img
                ref={editImagePreviewRef}
                src={
                  selectedEmployee.profileImageUrl ||
                  selectedEmployee.profileImage ||
                  'https://via.placeholder.com/100'
                }
                alt={selectedEmployee.name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
              <input
                type="text"
                name="name"
                defaultValue={selectedEmployee.name}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
              <select
                name="gender"
                defaultValue={selectedEmployee.gender}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                name="status"
                defaultValue={selectedEmployee.status}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
              <select
                name="department"
                defaultValue={selectedEmployee.department}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="IT">IT</option>
                <option value="Data Entry">Data Entry</option>
                <option value="Administration">Administration</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project</label>
              <select
                name="project"
                defaultValue={selectedEmployee.project}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a project</option>
                <option value="ADMIN">ADMIN</option>
                <option value="ADMIN">New</option>
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.name}>
                    {proj.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Change Profile Image</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file && editImagePreviewRef.current) {
                    editImagePreviewRef.current.src = URL.createObjectURL(file);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={closeEditModal}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};