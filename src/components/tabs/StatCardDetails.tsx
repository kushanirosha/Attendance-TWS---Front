// components/StatCardDetails.tsx
import { useState, useEffect } from "react";
import { fetchStats, type Stats } from "../../services/statsDetailsService";

const shiftColors: Record<string, string> = {
  Morning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Noon: "bg-blue-100 text-blue-800 border-blue-300",
  Night: "bg-purple-100 text-purple-800 border-purple-300",
};

const shiftTimings: Record<string, string> = {
  Morning: "5:30 AM - 1:30 PM",
  Noon: "1:30 PM - 9:30 PM",
  Night: "9:30 PM - 5:30 AM",
};

export const StatCardDetails = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      }
      setLoading(false);
    };

    loadStats();
    const interval = setInterval(loadStats, 30_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50">
        <div className="text-4xl font-bold text-blue-600 animate-pulse">
          Loading Stats...
        </div>
      </div>
    );
  }

  const projectNames = stats.projects || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 p-6">
      {/* Current Shift */}
      <div className={`max-w-4xl mx-auto rounded-3xl p-10 text-center shadow-2xl ${shiftColors[stats.currentShift]}`}>
        <h1 className="text-7xl font-black">{stats.currentShift} SHIFT</h1>
        <p className="text-3xl mt-4 font-semibold">{shiftTimings[stats.currentShift]}</p>
        <p className="text-lg mt-6 text-gray-700">Last Updated: {stats.updatedAt}</p>
      </div>

      {/* Total Active */}
      <div className="max-w-4xl mx-auto mt-10 bg-white rounded-3xl shadow-2xl p-10 text-center">
        <h2 className="text-5xl font-bold text-gray-800">TOTAL ACTIVE NOW</h2>
        <p className="text-9xl font-black text-blue-600 mt-6">{stats.active.total}</p>
        <p className="text-3xl mt-6 text-gray-700">
          <span className="text-green-600 font-bold">Male {stats.active.male}</span> • 
          <span className="text-pink-600 font-bold"> Female {stats.active.female}</span>
        </p>
      </div>

      {/* Projects Grid */}
      <div className="max-w-7xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {projectNames.map(project => {
          const data = stats.activeByProject[project];
          if (!data) return null;

          return (
            <div
              key={project}
              className="bg-white rounded-2xl shadow-xl p-8 text-center border-4 border-gray-300 hover:border-blue-500 transition-all"
            >
              <h3 className="text-3xl font-black text-gray-800 mb-4">{project}</h3>
              <p className="text-6xl font-bold text-blue-600">{data.total}</p>
              <p className="text-lg mt-4 text-gray-600">
                <span className="text-green-600 font-semibold">{data.male}♂</span> • 
                <span className="text-pink-600 font-semibold"> {data.female}♀</span>
              </p>
            </div>
          );
        })}
      </div>

      {/* Special Roles */}
      <div className="max-w-4xl mx-auto mt-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        {["LTL", "STL", "IT", "ADMIN"].map(role => (
          <div
            key={role}
            className="bg-gradient-to-br from-orange-100 to-orange-200 rounded-2xl shadow-xl p-8 text-center border-4 border-orange-400"
          >
            <h3 className="text-3xl font-bold text-orange-900">{role}</h3>
            <p className="text-7xl font-black text-orange-700 mt-4">
              {stats.activeNow[role] || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Absent */}
      <div className="max-w-4xl mx-auto mt-12 bg-gradient-to-r from-red-600 to-red-800 rounded-3xl shadow-2xl p-12 text-center text-white">
        <h2 className="text-5xl font-black">ABSENT TODAY</h2>
        <p className="text-9xl font-black mt-6">{stats.absent.total}</p>
        <p className="text-3xl mt-4">Employees</p>
      </div>
    </div>
  );
};