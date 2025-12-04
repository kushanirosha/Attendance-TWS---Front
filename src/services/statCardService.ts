// src/services/statCardService.ts
const API_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/stats`
  : "http://localhost:3000/api/stats";

export const fetchEmployeeStats = async () => {
  const res = await fetch(API_URL);
  if (!res.ok) throw new Error("Failed to fetch stats");
  const json = await res.json();
  if (!json.success) throw new Error(json.message);
  return json.data;
};