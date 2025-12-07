// src/services/statsDetailsService.ts

import axios from 'axios';

export interface ActiveNowRole {
  total: number;
  male: number;
  female: number;
}

export interface ProjectStats {
  total: number;
  male: number;
  female: number;
  employees: Array<{ id: string; name: string }>;
}

export interface Stats {
  currentShift: 'Morning' | 'Noon' | 'Night';
  updatedAt: string;
  projects: string[];
  present: Record<string, number>;
  activeByProject: Record<string, ProjectStats>;
  active: {
    total: number;
    male: number;
    female: number;
  };
  activeNow: {
    LTL: ActiveNowRole;
    STL: ActiveNowRole;
    IT: ActiveNowRole;
    ADMIN: ActiveNowRole;
  };
  absent: {
    total: number;
    list: Array<{
      id: string;
      name: string;
      project: string;
    }>;
  };
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';
const STATS_ENDPOINT = `${API_BASE}/api/stats-details`;

// CRITICAL: This must be a NAMED EXPORT
export const fetchStats = async (): Promise<Stats> => {
  try {
    const response = await axios.get(STATS_ENDPOINT);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    throw error;
  }
};