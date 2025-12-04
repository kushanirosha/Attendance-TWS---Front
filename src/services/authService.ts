// src/services/authService.ts
export interface User {
  id: number;
  employeeId: string;
  name: string;
  role: 'super_admin' | 'stl' | 'admin' | 'user';
}


export const authService = {
  async login(employeeId: string, password: string): Promise<User> {
    const res = await fetch("http://localhost:3000/api/auth/login", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || 'Login failed');
    }

    const user: User = data.user;
    sessionStorage.setItem('user', JSON.stringify(user));
    return user;
  },

  getUser(): User | null {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  logout(): void {
    sessionStorage.removeItem('user');
  },

  isLoggedIn(): boolean {
    return !!this.getUser();
  },
};