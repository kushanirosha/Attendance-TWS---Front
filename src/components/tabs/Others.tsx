// src/components/tabs/Others.tsx
import { useState, useEffect } from 'react';
import {
  othersService,
  cleaningStaffService,
  driversService,
  OtherStaff,
  CleaningStaff,
  Driver,
} from '../../services/othersService';
import toast from 'react-hot-toast';
import { Plus, Loader2, Edit, Trash2 } from 'lucide-react';

export const Others = () => {
  const [staff, setStaff] = useState<OtherStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedMember, setSelectedMember] = useState<OtherStaff | null>(null);

  const [form, setForm] = useState({
    id: '',
    name: '',
    gender: 'Male' as 'Male' | 'Female',
    status: 'Active' as 'Active' | 'Inactive',
    department: 'Cleaning Services' as 'Cleaning Services' | 'Transport Services',
    project: 'JANITOR' as 'JANITOR' | 'DRIVER',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    setLoading(true);
    try {
      const combined = await othersService.getAllCombined();
      setStaff(combined);
    } catch (err: any) {
      toast.error(err.message || 'Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      id: '',
      name: '',
      gender: 'Male',
      status: 'Active',
      department: 'Cleaning Services',
      project: 'JANITOR',
    });
    setIsEditMode(false);
    setSelectedMember(null);
    setShowForm(false);
  };

  const determineService = (department: string) => {
    return department === 'Transport Services' ? driversService : cleaningStaffService;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.name) {
      toast.error('Name is required');
      return;
    }

    if (!isEditMode && !form.id.trim()) {
      toast.error('Employee ID is required when creating new staff');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        name: form.name,
        gender: form.gender,
        status: form.status,
        department: form.department,
        project: form.project,
      };

      const service = determineService(form.department);

      if (isEditMode && selectedMember) {
        // Update
        await service.update(selectedMember.id, payload);
        toast.success('Staff updated successfully');
      } else {
        // Create
        await service.create({
          id: form.id.trim(),
          ...payload,
        });
        toast.success('Staff member added successfully');
      }

      resetForm();
      await loadStaff();
    } catch (err: any) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (member: OtherStaff) => {
    setForm({
      id: member.id,
      name: member.name,
      gender: member.gender,
      status: member.status,
      department: member.department as 'Cleaning Services' | 'Transport Services',
      project: member.project as 'JANITOR' | 'DRIVER',
    });
    setSelectedMember(member);
    setIsEditMode(true);
    setShowForm(true);
  };

  const handleDelete = async (member: OtherStaff) => {
    if (!window.confirm(`Delete ${member.name}? This cannot be undone.`)) return;

    try {
      const service = determineService(member.department);
      await service.delete(member.id);
      toast.success('Staff member deleted');
      await loadStaff();
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">JANITOR & Driver Management</h2>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          disabled={showForm || submitting}
        >
          <Plus className="w-5 h-5" />
          Add New Staff
        </button>
      </div>

      {/* Form - Create / Edit */}
      {showForm && (
        <div className="bg-white rounded-xl shadow border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-5">
            {isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Employee ID {isEditMode && '(cannot be changed)'}
                </label>
                <input
                  type="text"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. J025 or D008"
                  disabled={isEditMode || submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g. Dimantha Perera"
                  disabled={submitting}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Gender</label>
                <select
                  value={form.gender}
                  onChange={(e) => setForm({ ...form, gender: e.target.value as 'Male' | 'Female' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as 'Active' | 'Inactive' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                <select
                  value={form.department}
                  onChange={(e) => {
                    const dept = e.target.value as 'Cleaning Services' | 'Transport Services';
                    setForm({
                      ...form,
                      department: dept,
                      project: dept === 'Transport Services' ? 'DRIVER' : 'JANITOR',
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting}
                >
                  <option value="Cleaning Services">Cleaning Services</option>
                  <option value="Transport Services">Transport Services</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Project / Role</label>
                <select
                  value={form.project}
                  onChange={(e) => setForm({ ...form, project: e.target.value as 'JANITOR' | 'DRIVER' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  disabled={submitting || form.department === 'Transport Services' || form.department === 'Cleaning Services'}
                >
                  <option value="JANITOR">Janitor</option>
                  <option value="DRIVER">Driver</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-2.5 rounded-md font-medium flex items-center gap-2 disabled:opacity-60 transition-colors"
              >
                {submitting && <Loader2 className="w-5 h-5 animate-spin" />}
                {isEditMode ? 'Update' : 'Create'}
              </button>

              <button
                type="button"
                onClick={resetForm}
                disabled={submitting}
                className="bg-gray-200 hover:bg-gray-300 px-6 py-2.5 rounded-md font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl shadow border border-gray-200 overflow-hidden bg-white">
        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600 mb-3" />
            <p className="text-gray-600">Loading staff members...</p>
          </div>
        ) : staff.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No staff members found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {staff.map((member, idx) => (
                  <tr
                    key={member.id}
                    className={`${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50/60 transition-colors`}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{member.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.gender}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === 'Active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{member.department}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.project === 'DRIVER'
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {member.project}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {member.created_at ? new Date(member.created_at).toLocaleDateString('en-GB') : '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-4">
                        <button
                          onClick={() => handleEdit(member)}
                          className="text-blue-600 hover:text-blue-800 transition-colors"
                          title="Edit"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(member)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};