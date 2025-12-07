// src/services/statsService.ts
import axios from 'axios';

// Updated interface to match your REAL backend response
export interface ProjectStats {
  total: number;
  male: number;
  female: number;
  employees: Array<{ id: string; name: string }>;
}

export interface Stats {
  currentShift: 'Morning' | 'Noon' | 'Night';
  updatedAt: string;

  // Dynamic projects from DB
  projects: string[];

  // Present count per project (dynamic keys)
  present: Record<string, number>;

  // Full active breakdown per project
  activeByProject: Record<string, ProjectStats>;

  // Overall active
  active: {
    total: number;
    male: number;
    female: number;
  };

  // Special roles
  activeNow: {
    LTL: number;
    STL: number;
    IT: number;
    ADMIN: number;
  };

  // Absent
  absent: {
    total: number;
    list: Array<{
      id: string;
      name: string;
      project: string;
    }>;
  };
}

// Use your correct endpoint
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const STATS_ENDPOINT = `${API_BASE}/api/stats-details`;

export const fetchStats = async (): Promise<Stats> => {
  try {
    const response = await axios.get(STATS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stats from backend:', error);

    // Optional: Return realistic mock data for offline/demo
    return {
      currentShift: 'Night',
      updatedAt: new Date().toLocaleString(),
      projects: ['W', 'A', 'HOB', 'KK8-W', 'KK8-D', 'W1W'],
      present: {
        W: 38,
        A: 15,
        HOB: 12,
        'KK8-W': 8,
        'KK8-D': 4,
        W1W: 2,
      },
      activeByProject: {
        W: {
          total: 38,
          male: 28,
          female: 10,
          employees: [{ id: '1001', name: 'Kasun Perera' }, { id: '1013', name: 'Nimal Silva' }]
        },
        A: { total: 15, male: 10, female: 5, employees: [] },
        HOB: { total: 12, male: 9, female: 3, employees: [] },
        'KK8-W': { total: 8, male: 6, female: 2, employees: [] },
        'KK8-D': { total: 4, male: 3, female: 1, employees: [] },
        W1W: { total: 2, male: 1, female: 1, employees: [] },
      },
      active: { total: 79, male: 49, female: 30 },
      activeNow: { LTL: 9, STL: 1, IT: 0, ADMIN: 0 },
      absent: {
        total: 3,
        list: [
          { id: '1175', name: 'ID:1175', project: 'W' },
          { id: '1183', name: 'ID:1183', project: 'A' },
          { id: '1263', name: 'ID:1263', project: 'HOB' },
        ]
      }
    };
  }
};