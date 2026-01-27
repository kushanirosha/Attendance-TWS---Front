// src/services/usersService.ts
export interface User {
  id: number;
  employee_id: string;
  name: string;
  role: 'super_admin' | 'pts' | 'admin' | 'user';
  created_at?: string;
}

const API_URL = 'https://backend.tws.ceyloncreative.online';

export const usersService = {
  async getAll(): Promise<User[]> {
    const res = await fetch(`${API_URL}/api/users`);
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch users');
    return data.users;
  },

  async create(user: {
    employeeId: string;
    name: string;
    password: string;
    role: User['role'];
  }): Promise<User> {
    const res = await fetch(`${API_URL}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employee_id: user.employeeId,
        name: user.name,
        password: user.password,
        role: user.role,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create user');
    return data.user;
  },
};