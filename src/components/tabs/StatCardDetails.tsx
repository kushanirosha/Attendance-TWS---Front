// components/StatCardDetails.tsx
import { useState, useEffect } from "react";
import { fetchStats, type Stats } from "../../services/statsDetailsService";

const shiftBg: Record<string, string> = {
  Morning: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Noon: "bg-blue-100 text-blue-800 border-blue-300",
  Night: "bg-green-100 text-green-800 border-green-300",
};

const shiftTimings: Record<string, string> = {
  Morning: "5:30 AM - 1:30 PM",
  Noon: "1:30 PM - 9:30 PM",
  Night: "9:30 PM - 5:30 AM",
};

// Modal Component (kept almost identical)
const EmployeeListModal = ({
  title,
  employees,
  onClose,
}: {
  title: string;
  employees: { id: string; name: string }[];
  onClose: () => void;
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center">
          <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[65vh]">
          {employees.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No employees found</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {employees.map((emp) => (
                <div
                  key={emp.id}
                  className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex justify-between items-center"
                >
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-600">ID: {emp.id}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const StatCardDetails = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<{
    title: string;
    employees: { id: string; name: string }[];
  } | null>(null);

  useEffect(() => {
    const loadStats = async () => {
      setLoading(true);
      try {
        const data = await fetchStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
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

  const regularProjects = (stats.projects || []).filter(
    (p) => !["IT", "TL", "PTS", "ADMIN"].includes(p)
  );

  return (
    <div className="space-y-6 pt-5">
      {/* CURRENT SHIFT CARD */}
      <div
        className={`rounded-2xl p-2 text-center shadow-lg border-2 ${
          shiftBg[stats.currentShift] || "bg-gray-200 border-gray-400"
        }`}
      >
        <h1 className="text-4xl font-bold">{stats.currentShift} Shift</h1>
        <p className="text-lg mt-2 opacity-90">
          {shiftTimings[stats.currentShift] ?? "Timings not available"}
        </p>
      </div>

      {/* TOTAL ACTIVE NOW */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl shadow-md border p-3 text-center">
        <h2 className="text-2xl font-semibold text-gray-700">Total Active Now</h2>
        <p className="text-6xl font-extrabold text-blue-600 mt-4">
          {stats.active?.total ?? 0}
        </p>
        <div className="flex justify-center gap-10 mt-6 text-lg">
          <span className="text-green-600 font-semibold">
            Male: {stats.active?.male ?? 0}
          </span>
          <span className="text-pink-600 font-semibold">
            Female: {stats.active?.female ?? 0}
          </span>
        </div>
      </div>

      {/* SPECIAL ROLES - Clickable */}
      <div className="bg-white rounded-2xl shadow-md border p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Special Roles Active Now
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {(["TL", "PTS", "IT", "ADMIN"] as const).map((roleKey) => {
            const displayLabel: Record<typeof roleKey, string> = {
              TL: "TL",
              PTS: "PTS",
              IT: "IT",
              ADMIN: "Admin",
            };

            const data = stats.activeNow?.[roleKey] ?? {
              total: 0,
              male: 0,
              female: 0,
            };

            // Employees come from activeByProject for special roles
            const employees = stats.activeByProject?.[roleKey]?.employees ?? [];

            return (
              <button
                key={roleKey}
                onClick={() =>
                  setSelectedGroup({
                    title: `${displayLabel[roleKey]} (${data.total})`,
                    employees,
                  })
                }
                className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-xl p-6 text-center border border-indigo-200 hover:shadow-xl hover:scale-[1.02] transition-all cursor-pointer"
              >
                <h3 className="text-lg font-bold text-indigo-800">
                  {displayLabel[roleKey]}
                </h3>
                <p className="text-4xl font-extrabold text-indigo-600 mt-3">
                  {data.total}
                </p>
                <div className="flex justify-center gap-4 mt-3 text-sm">
                  <span className="text-green-600 font-medium">
                    Male: {data.male}
                  </span>
                  <span className="text-pink-600 font-medium">
                    Female: {data.female}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* PROJECT WISE ACTIVE - Clickable + filtered */}
      <div className="bg-white rounded-2xl shadow-md border p-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">
          Project Wise Active
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
          {regularProjects.map((project) => {
            const data = stats.activeByProject?.[project];
            if (!data?.total) return null;

            return (
              <button
                key={project}
                onClick={() =>
                  setSelectedGroup({
                    title: `${project} (${data.total})`,
                    employees: data.employees ?? [],
                  })
                }
                className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 text-center border hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
              >
                <h3 className="text-sm font-bold text-gray-700 truncate">
                  {project}
                </h3>
                <p className="text-3xl font-extrabold text-blue-600 mt-2">
                  {data.total}
                </p>
                <div className="flex justify-center gap-3 mt-2 text-xs">
                  <span className="text-green-600 font-medium">
                    Male: {data.male ?? 0}
                  </span>
                  <span className="text-pink-600 font-medium">
                    Female: {data.female ?? 0}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ABSENT EMPLOYEES */}
      <div className="bg-red-50 rounded-2xl border-2 border-red-200 p-8">
        <h2 className="text-2xl font-bold text-red-800 text-center mb-6">
          Absent Current Shift ({stats.absent?.total ?? 0})
        </h2>

        {stats.absent?.total === 0 ? (
          <p className="text-center text-green-600 font-semibold text-lg">
            All Present! Great Job Team!
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(stats.absent?.list ?? []).map((emp) => (
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

      {/* Modal */}
      {selectedGroup && (
        <EmployeeListModal
          title={selectedGroup.title}
          employees={selectedGroup.employees}
          onClose={() => setSelectedGroup(null)}
        />
      )}
    </div>
  );
};