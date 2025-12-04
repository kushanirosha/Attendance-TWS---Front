import { useState, useEffect } from "react";
import { fetchStats, type Stats } from "../../services/statsDetailsService";

// Shift styling
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
      const data = await fetchStats();
      setStats(data);
      setLoading(false);
    };

    loadStats();
  }, []);

  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-2xl text-gray-500">Loading stats...</div>
      </div>
    );
  }

  const currentShift = stats.currentShift;

  return (
    <div className="space-y-8 p-6 ">
      {/* Current Shift Header */}
      <div className={`rounded-2xl border-4 p-6 text-center ${shiftColors[currentShift]}`}>
        <h2 className="text-4xl font-bold">Current Shift: {currentShift}</h2>
        <p className="text-3xl mt-3 opacity-90">{shiftTimings[currentShift]}</p>
      </div>

      {/* Present Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-blue-900 text-white text-center py-3 text-2xl font-bold">
          Present
        </div>
        <table className="w-full text-lg">
          <thead className="bg-blue-800 text-white">
            <tr>
              <th className="py-3 px-4">Project</th>
              <th className="py-3 px-4">W</th>
              <th className="py-3 px-4">A</th>
              <th className="py-3 px-4">KK8-W</th>
              <th className="py-3 px-4">KK8-D</th>
              <th className="py-3 px-4">W1W</th>
              <th className="py-3 px-4">HOB</th>
            </tr>
          </thead>
          <tbody className="text-center">
            <tr className="bg-gray-50">
              <td className="py-3 font-semibold">Female</td>
              <td>{stats.present.W}</td>
              <td>{stats.present.A}</td>
              <td>{stats.present['KK8-W']}</td>
              <td>{stats.present['KK8-D']}</td>
              <td>{stats.present.W1W}</td>
              <td>{stats.present.HoB}</td>
            </tr>
            <tr>
              <td className="py-3 font-semibold">Male</td>
              <td>8</td>
              <td>1</td>
              <td>4</td>
              <td>2</td>
              <td>2</td>
              <td>4</td>
            </tr>
            <tr className="bg-yellow-50 font-bold">
              <td className="py-3">Absent</td>
              <td>5</td>
              <td>1</td>
              <td>1</td>
              <td>2</td>
              <td>3</td>
              <td>8</td>
            </tr>
            <tr className="bg-blue-100 font-bold text-xl">
              <td className="py-4">ACTIVE</td>
              <td colSpan={6} className="text-4xl text-blue-900">
                {stats.active.total}
              </td>
            </tr>
          </tbody>
        </table>

        {/* Active Summary */}
        <div className="grid grid-cols-3 text-center py- py-4 bg-gray-50 border-t-2 border-gray-300">
          <div>
            <p className="text-lg font-semibold text-blue-700">Active</p>
            <p className="text-3xl font-bold">{stats.active.total}</p>
            <p className="text-sm">Male: {stats.active.male} | Female: {stats.active.female}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-green-700">Male</p>
            <p className="text-3xl font-bold text-green-600">{stats.active.male}</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-pink-700">Female</p>
            <p className="text-3xl font-bold text-pink-600">{stats.active.female}</p>
          </div>
          <div className="col-span-3 mt-4">
            <p className="text-lg font-semibold text-red-700">Absent</p>
            <p className="text-3xl font-bold text-red-600">{stats.absent.total}</p>
          </div>
        </div>
      </div>

      {/* Active Now */}
      <div>
        <h3 className="text-2xl font-bold text-center mb-6 text-gray-800">Active Now</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-blue-100 rounded-2xl p-6 text-center shadow-md">
            <h4 className="text-xl font-semibold text-blue-900">LTL</h4>
            <p className="text-5xl font-bold text-blue-700 mt-2">{stats.activeNow.LTL}</p>
            <p className="text-sm text-gray-600 mt-2">Names</p>
          </div>
          <div className="bg-orange-100 rounded-2xl p-6 text-center shadow-md">
            <h4 className="text-xl font-semibold text-orange-900">STL</h4>
            <p className="text-5xl font-bold text-orange-700 mt-2">{stats.activeNow.STL}</p>
            <p className="text-sm text-gray-600 mt-2">Names</p>
          </div>
          <div className="bg-green-100 rounded-2xl p-6 text-center shadow-md">
            <h4 className="text-xl font-semibold text-green-900">IT</h4>
            <p className="text-5xl font-bold text-green-700 mt-2">{stats.activeNow.IT}</p>
            <p className="text-sm text-gray-600 mt-2">Names</p>
          </div>
          <div className="bg-red-100 rounded-2xl p-6 text-center shadow-md">
            <h4 className="text-xl font-semibold text-red-900">ADMIN</h4>
            <p className="text-5xl font-bold text-red-700 mt-2">{stats.activeNow.ADMIN}</p>
            <p className="text-sm text-gray-600 mt-2">Names</p>
          </div>
        </div>
      </div>

      {/* Absent List */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-red-800 text-white text-center py-3 text-2xl font-bold">
          Absent
        </div>
        <table className="w-full">
          <thead className="bg-red-700 text-white text-lg">
            <tr>
              <th className="py-3">W</th>
              <th className="py-3">A</th>
              <th className="py-3">KK8-W</th>
              <th className="py-3">KK8-D</th>
              <th className="py-3">W1W</th>
              <th className="py-3">HOB</th>
              <th className="py-3">LTL</th>
              <th className="py-3">STL</th>
              <th className="py-3">IT</th>
            </tr>
          </thead>
          <tbody>
            {stats.absentList.map((person, i) => (
              <tr key={i} className="text-center odd:bg-gray-50">
                <td className="py-3">{person.project === 'W' ? person.name : ''}</td>
                <td>{person.project === 'A' ? person.name : ''}</td>
                <td>{person.project === 'KK8-W' ? person.name : ''}</td>
                <td>{person.project === 'KK8-D' ? person.name : ''}</td>
                <td>{person.project === 'W1W' ? person.name : ''}</td>
                <td>{person.project === 'HoB' ? person.name : ''}</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};