// services/reportService.ts
import { AttendanceReport } from "../types/index.js";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3000";

export interface AttendanceDay {
  shift: string;
  checkIn: string;
  checkOut: string;
  status: string;
  remark: string;        // ← NEW
  working: string;
}

export interface AttendanceReport {
  employeeId: string;
  gender: string;        // ← NEW (optional, but present)
  project: string;       // ← NEW
  attendance: { [day: string]: AttendanceDay };
  summaries: {
    assigned: number;
    working: number;
    rd: number;
    absent: number;
    late: number;
  };
}

export const fetchAttendanceReports = async (
  employeeIds: string[],
  year: number,
  month: number // 0-based: 0 = January, 11 = December
): Promise<AttendanceReport[]> => {
  if (employeeIds.length === 0) {
    throw new Error("No employees selected");
  }

  const params = new URLSearchParams({
    employeeIds: employeeIds.join(","),
    year: year.toString(),
    month: month.toString(),
  });

  const url = `${API_BASE}/api/reports?${params}`;

  console.log("[Reports Service] Fetching from:", url);

  const response = await fetch(url);

  if (!response.ok) {
    let errorMessage = "Failed to fetch reports";
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorMessage;
    } catch {
      errorMessage = `Server error (${response.status})`;
    }
    throw new Error(errorMessage);
  }

  const result = await response.json();

  if (!result.success) {
    throw new Error(result.message || "Failed to load reports");
  }

  // result.data is the array of AttendanceReport
  return result.data;
};