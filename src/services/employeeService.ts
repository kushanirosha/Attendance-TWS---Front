import { Employee } from "../types";

const API_BASE = "http://localhost:3000/api/employees";

const buildFormData = (obj: any, file?: File) => {
  const fd = new FormData();
  Object.entries(obj).forEach(([k, v]) => {
    if (v !== undefined && v !== null) fd.append(k, v as string);
  });
  if (file) fd.append("profileImage", file);
  return fd;
};

export const fetchEmployees = async (): Promise<Employee[]> => {
  const r = await fetch(API_BASE);
  const d = await r.json();
  if (!d.success) throw new Error(d.message);
  return d.data;
};

export const addEmployee = async (
  emp: Omit<Employee, "id"> & { id: string },
  file?: File
): Promise<Employee> => {
  const r = await fetch(API_BASE, { method: "POST", body: buildFormData(emp, file) });
  const txt = await r.text();
  let d;
  try { d = JSON.parse(txt); } catch { throw new Error(`Invalid JSON: ${txt.slice(0, 200)}`); }
  if (!d.success) throw new Error(d.message);
  return d.data;
};

export const updateEmployee = async (
  id: string,
  updates: Partial<Employee>,
  file?: File
): Promise<Employee> => {
  const r = await fetch(`${API_BASE}/${id}`, { method: "PUT", body: buildFormData(updates, file) });
  const txt = await r.text();
  let d;
  try { d = JSON.parse(txt); } catch { throw new Error(`Invalid JSON: ${txt.slice(0, 200)}`); }
  if (!d.success) throw new Error(d.message);
  return d.data;
};

export const deleteEmployee = async (id: string) => {
  const r = await fetch(`${API_BASE}/${id}`, { method: "DELETE" });
  const d = await r.json();
  if (!d.success) throw new Error(d.message);
};

export const getEmployeeById = async (id: string): Promise<Employee> => {
  const r = await fetch(`${API_BASE}/${id}`);
  const d = await r.json();
  if (!d.success) throw new Error(d.message);
  return d.data;
};