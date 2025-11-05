import { Employee } from '../types';

const API_BASE = 'http://localhost:3000/api/employees';

export const fetchEmployees = async (): Promise<Employee[]> => {
  const res = await fetch(API_BASE);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch employees');
  return data.data;
};

export const addEmployee = async (employee: Omit<Employee, 'id'> & { id: string }): Promise<Employee> => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to add employee');
  return data.data;
};

export const updateEmployee = async (id: string, employee: Partial<Employee>): Promise<Employee> => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(employee),
  });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to update employee');
  return data.data;
};

export const deleteEmployee = async (id: string): Promise<void> => {
  const res = await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to delete employee');
};

// ✅ NEW: Fetch single employee by ID (used for project employee IDs)
export const getEmployeeById = async (id: string): Promise<Employee> => {
  const res = await fetch(`${API_BASE}/${id}`);
  const data = await res.json();
  if (!data.success) throw new Error(data.message || 'Failed to fetch employee');
  return data.data;
};
