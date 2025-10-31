import axios from 'axios';

export interface Project {
  id: string;
  name: string;
  department: string;
  employees: string[];
}

const API_URL = 'http://localhost:3000/api/projects';

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await axios.get(API_URL);
  return res.data.data;
};

export const fetchProjectById = async (id: string): Promise<Project> => {
  const res = await axios.get(`${API_URL}/${id}`);
  return res.data.data;
};

export const addProject = async (project: Omit<Project, 'id'>): Promise<Project> => {
  const res = await axios.post(API_URL, project);
  return res.data.data;
};

export const updateProject = async (id: string, updates: Partial<Project>): Promise<Project> => {
  const res = await axios.put(`${API_URL}/${id}`, updates);
  return res.data.data;
};

export const deleteProject = async (id: string): Promise<void> => {
  await axios.delete(`${API_URL}/${id}`);
};
