// components/StatCardDetails.tsx
import { useState, useEffect } from "react";
import { fetchStats, type Stats } from "../../services/statsDetailsService";

const shiftBg: Record<string, string> = {
  Morning: "bg-yellow-50 text-yellow-800 border-yellow-200",
  Noon: "bg-blue-50 text-blue-800 border-blue-200",
  Night: "bg-purple-50 text-purple-800 border-purple-200",
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
    const interval = setInterval(loadStats, 90_000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="text-xl font-semibold text-blue-600 animate-pulse">
          Loading Stats...
        </div>
      </div>
    );
  }

  const projectNames = stats.projects || [];

  return (
    <div className="space-y-6 p-6">

      {/* ===== SHIFT CARD ===== */}
      <div className={`rounded-2xl p-8 text-center shadow-lg border-2 ${shiftBg[stats.currentShift]}`}>
        <h1 className="text-4xl font-bold">{stats.currentShift} Shift</h1>
        <p className="text-lg mt-2 opacity-90">{shiftTimings[stats.currentShift]}</p>
        <p className="text-sm mt-4 text-gray-600">
          {/*Updated: {new Date(stats.updatedAt).toLocaleTimeString()}*/}
        </p>
      </div>

      {/* ===== TOTAL ACTIVE NOW ===== */}
      <div className="bg-white rounded-2xl shadow-md border p-8 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Total Active Now</h2>
        <p className="text-6xl font-extrabold text-blue-600 mt-4">{stats.active.total}</p>
        <div className="flex justify-center gap-10 mt-6 text-lg">
          <span className="text-green-600 font-semibold">Male {stats.active.male}</span>
          <span className="text-pink-600 font-semibold">Female {stats.active.female}</span>
        </div>
      </div>

      {/* ===== SPECIAL ROLES (LTL, STL, IT, ADMIN) ===== */}
      <div className="bg-white rounded-2xl shadow-md border p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Special Roles Active Now</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(["LTL", "STL", "IT", "ADMIN"] as const).map((role) => {
            const data = stats.activeNow[role];
            return (
              <div key={role} className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 text-center border border-indigo-200">
                <h3 className="text-lg font-bold text-indigo-800">{role}</h3>
                <p className="text-4xl font-extrabold text-indigo-600 mt-3">{data.total}</p>
                <div className="flex justify-center gap-4 mt-3 text-sm">
                  <span className="text-green-600 font-medium">Male {data.male}</span>
                  <span className="text-pink-600 font-medium">Female {data.female}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== PROJECT WISE ACTIVE ===== */}
      <div className="bg-white rounded-2xl shadow-md border p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Project Wise Active</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {projectNames.map((project) => {
            const data = stats.activeByProject[project];
            if (!data) return null;

            return (
              <div
                key={project}
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border hover:shadow-lg transition-shadow"
              >
                <h3 className="text-sm font-bold text-gray-700 truncate">{project}</h3>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">{data.total}</p>
                <div className="flex justify-center gap-3 mt-2 text-xs">
                  <span className="text-green-600 font-medium">Male {data.male}</span>
                  <span className="text-pink-600 font-medium">Female {data.female}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== ABSENT EMPLOYEES ===== */}
      <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-8">
        <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
          Absent Today ({stats.absent.total})
        </h2>
        {stats.absent.total === 0 ? (
          <p className="text-center text-green-600 font-semibold text-lg">
            All Present! Great Job Team!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {stats.absent.list.map((emp) => (
              <div
                key={emp.id}
                className="bg-white rounded-lg p-4 shadow-sm border border-red-100 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{emp.name}</p>
                  <p className="text-sm text-gray-600">ID: {emp.id}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded-full font-medium">
                  {emp.project}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};