import { Attendance } from "../types";

interface AttendanceResponse {
  success: boolean;
  data: Attendance[];
  message?: string;
}

export const fetchAttendance = async (): Promise<Attendance[]> => {
  try {
    const res = await fetch("http://localhost:3000/api/attendance");
    const json: AttendanceResponse = await res.json();

    if (!json.success) throw new Error(json.message || "Failed to fetch attendance");

    return json.data;
  } catch (err) {
    console.error("Error fetching attendance:", err);
    throw err;
  }
};
