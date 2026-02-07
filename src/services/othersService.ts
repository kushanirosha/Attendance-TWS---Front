// src/services/othersService.ts

// ────────────────────────────────────────────────
// Type Definitions
// ────────────────────────────────────────────────
export interface CleaningStaff {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  status: 'Active' | 'Inactive';
  department: string;           // usually "Cleaning Services"
  project: string;              // usually "JANITOR" or "JANITOR"
  created_at?: string;
  updated_at?: string;
}

export interface Driver {
  id: string;
  name: string;
  gender: 'Male' | 'Female';
  status: 'Active' | 'Inactive';
  department: string;           // usually "Transport Services"
  project: string;              // usually "DRIVER"
  created_at?: string;
  updated_at?: string;
}

export type OtherStaff = CleaningStaff | Driver;

// ────────────────────────────────────────────────
// Base Configuration
// ────────────────────────────────────────────────
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Helper to handle fetch responses
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// ────────────────────────────────────────────────
// Cleaning Staff (JANITOR) CRUD
// ────────────────────────────────────────────────
export const cleaningStaffService = {
  /**
   * Get all cleaning/JANITOR staff
   */
  async getAll(): Promise<CleaningStaff[]> {
    const response = await fetch(`${API_BASE_URL}/others/cleaning`);
    const data = await handleResponse<{ staff: CleaningStaff[] }>(response);
    return data.staff;
  },

  /**
   * Get single cleaning staff member by ID
   */
  async getById(id: string): Promise<CleaningStaff> {
    const response = await fetch(`${API_BASE_URL}/others/cleaning/${id}`);
    const data = await handleResponse<{ staff: CleaningStaff }>(response);
    return data.staff;
  },

  /**
   * Create new cleaning staff member
   * Note: backend expects id to be provided (manual)
   */
  async create(staff: Omit<CleaningStaff, 'created_at' | 'updated_at'>): Promise<CleaningStaff> {
    const response = await fetch(`${API_BASE_URL}/others/cleaning`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staff),
    });
    const data = await handleResponse<{ staff: CleaningStaff }>(response);
    return data.staff;
  },

  /**
   * Update existing cleaning staff member
   */
  async update(id: string, updates: Partial<Omit<CleaningStaff, 'id' | 'created_at' | 'updated_at'>>): Promise<CleaningStaff> {
    const response = await fetch(`${API_BASE_URL}/others/cleaning/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ staff: CleaningStaff }>(response);
    return data.staff;
  },

  /**
   * Delete cleaning staff member
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/others/cleaning/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response); // no content expected on success
  },
};

// ────────────────────────────────────────────────
// Drivers CRUD
// ────────────────────────────────────────────────
export const driversService = {
  /**
   * Get all drivers
   */
  async getAll(): Promise<Driver[]> {
    const response = await fetch(`${API_BASE_URL}/others/drivers`);
    const data = await handleResponse<{ drivers: Driver[] }>(response);
    return data.drivers;
  },

  /**
   * Get single driver by ID
   */
  async getById(id: string): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/others/drivers/${id}`);
    const data = await handleResponse<{ driver: Driver }>(response);
    return data.driver;
  },

  /**
   * Create new driver
   */
  async create(driver: Omit<Driver, 'created_at' | 'updated_at'>): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/others/drivers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(driver),
    });
    const data = await handleResponse<{ driver: Driver }>(response);
    return data.driver;
  },

  /**
   * Update existing driver
   */
  async update(id: string, updates: Partial<Omit<Driver, 'id' | 'created_at' | 'updated_at'>>): Promise<Driver> {
    const response = await fetch(`${API_BASE_URL}/others/drivers/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updates),
    });
    const data = await handleResponse<{ driver: Driver }>(response);
    return data.driver;
  },

  /**
   * Delete driver
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/others/drivers/${id}`, {
      method: 'DELETE',
    });
    await handleResponse(response);
  },
};

// ────────────────────────────────────────────────
// Combined / Convenience Methods (optional)
// ────────────────────────────────────────────────
export const othersService = {
  async getAllCombined(): Promise<OtherStaff[]> {
    const [cleaning, drivers] = await Promise.all([
      cleaningStaffService.getAll(),
      driversService.getAll(),
    ]);

    return [...cleaning, ...drivers].sort((a, b) => a.id.localeCompare(b.id));
  },

  // You can add more combined helpers if needed
};

export default {
  cleaning: cleaningStaffService,
  drivers: driversService,
  combined: othersService,
};