import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api/shiftAssignments";

export const fetchShiftAssignments = async (projectId: string, monthYear: string) => {
  const res = await axios.get(`${API_URL}/api/shiftAssignments/${projectId}/${monthYear}`);
  return res.data; // { assignments: { ... } }
};

export const saveShiftAssignments = async (data: {
  projectId: string;
  monthYear: string;
  assignments: { [employeeId: string]: { [day: string]: string } };
}) => {
  const res = await axios.post(API_URL, data);
  return res.data; // { inserted: true | false }
};