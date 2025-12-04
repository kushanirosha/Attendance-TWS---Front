// src/services/statsService.ts
import axios from 'axios';

export interface Stats {
  currentShift: 'Morning' | 'Noon' | 'Night';
  present: {
    W: number;
    A: number;
    'KK8-W': number;
    'KK8-D': number;
    W1W: number;
    HoB: number;
  };
  gender: {
    male: number;
    female: number;
  };
  active: {
    total: number;
    male: number;
    female: number;
  };
  absent: {
    total: number;
  };
  activeNow: {
    LTL: number;
    STL: number;
    IT: number;
    ADMIN: number;
  };
  absentList: Array<{
    name: string;
    project?: string;
    reason?: string;
  }>;
}

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/stats-details';

export const fetchStats = async (): Promise<Stats> => {
  try {
    const response = await axios.get(`${API_BASE}/stats/current`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error);
    // Return mock data for demo/offline (remove in production if not needed)
    return getMockStats();
  }
};

// Optional: Mock data matching your screenshot (for development)
const getMockStats = (): Stats => ({
  currentShift: 'Morning',
  present: {
    W: 9,
    A: 2,
    'KK8-W': 4,
    'KK8-D': 2,
    W1W: 1,
    HoB: 4,
  },
  gender: { male: 17, female: 25 },
  active: { total: 59, male: 25, female: 17 },
  absent: { total: 4 },
  activeNow: {
    LTL: 9,
    STL: 1,
    IT: 2,
    ADMIN: 3,
  },
  absentList: [
    { name: 'KAUSHALYA', project: 'W' },
    { name: 'RISHIKESH', project: 'A' },
    { name: 'OSHADA', project: 'KK8-W' },
    { name: 'SETHMI', project: 'HoB' },
  ],
});