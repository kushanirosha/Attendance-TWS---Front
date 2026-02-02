import axios from "axios";

const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const API_URL = `${BASE_URL}/api/shiftAssignments`;   // ← add the missing path here

export const fetchShiftAssignments = async (projectId: string, monthYear: string) => {
  const res = await axios.get(`${API_URL}/${projectId}/${monthYear}`);
  return res.data; // { assignments: { ... } }
};

export const saveShiftAssignments = async (data: {
  projectId: string;
  monthYear: string;
  assignments: { [employeeId: string]: { [day: string]: string } };
}) => {
  const res = await axios.post(API_URL, data);    // ← now uses correct full path
  return res.data; // { inserted: true | false }
};