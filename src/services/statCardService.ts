import { Employee } from "../types";

// API Base (can be shared via env or config later)
const API_BASE = 'http://localhost:3000/api/employees';

/**
 * Fetches employee statistics grouped by gender and status
 * Returns structured counts for dashboard StatCards
 */
export const fetchEmployeeStats = async () => {
  try {
    const res = await fetch(API_BASE);
    const json = await res.json();

    if (!json.success) {
      throw new Error(json.message || 'Failed to fetch employee stats');
    }

    const employees: Employee[] = json.data;

    // Helper: Count employees matching condition
    const countBy = (
      condition: (emp: Employee) => boolean
    ): { male: number; female: number } => {
      const male = employees.filter(emp => condition(emp) && emp.gender === 'Male').length;
      const female = employees.filter(emp => condition(emp) && emp.gender === 'Female').length;
      return { male, female };
    };

    // Active Employees (Total Active)
    const active = countBy(emp => emp.status === 'Active');

    // Present
    const present = countBy(emp => emp.attendance === 'Present');

    // Absent
    const absent = countBy(emp => emp.attendance === 'Absent');

    // Late
    const late = countBy(emp => emp.attendance === 'Late');

    // Early Punchout
    const earlyPunchout = countBy(emp => emp.attendance === 'Early Punchout');

    // Rest Day
    const restDay = countBy(emp => emp.attendance === 'Rest Day');

    return {
      totalActive: {
        male: active.male,
        female: active.female,
        total: active.male + active.female,
        format: () => `M: ${active.male} | F: ${active.female}`
      },
      present: {
        male: present.male,
        female: present.female,
        total: present.male + present.female,
        format: () => `M: ${present.male} | F: ${present.female}`
      },
      absent: {
        male: absent.male,
        female: absent.female,
        total: absent.male + absent.female,
        format: () => `M: ${absent.male} | F: ${absent.female}`
      },
      late: {
        male: late.male,
        female: late.female,
        total: late.male + late.female,
        format: () => `M: ${late.male} | F: ${late.female}`
      },
      earlyPunchout: {
        male: earlyPunchout.male,
        female: earlyPunchout.female,
        total: earlyPunchout.male + earlyPunchout.female,
        format: () => `M: ${earlyPunchout.male} | F: ${earlyPunchout.female}`
      },
      restDay: {
        male: restDay.male,
        female: restDay.female,
        total: restDay.male + restDay.female,
        format: () => `M: ${restDay.male} | F: ${restDay.female}`
      }
    };
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    throw error;
  }
};