// src/services/statCardService.ts
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/stats`
  : "http://localhost:3000/api/stats";

const getCurrentMonthYear = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export const fetchEmployeeStats = async () => {
  const monthYear = getCurrentMonthYear();
  const res = await fetch(`${API_URL}?monthYear=${monthYear}`);

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Failed to load stats: ${res.status} ${txt}`);
  }

  const json = await res.json();
  if (!json.success) throw new Error(json.message || "Backend error");

  return json.data;
};