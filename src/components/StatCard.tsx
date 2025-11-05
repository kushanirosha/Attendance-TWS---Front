import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: string; // color will decide gradient tone
}

export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  // Extract male/female counts
  const match = value.match(/M:\s*(\d+)\s*\|\s*F:\s*(\d+)/);
  const male = match ? parseInt(match[1]) : 0;
  const female = match ? parseInt(match[2]) : 0;
  const total = male + female;

  // Gradient map for calm tones
  const gradients: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100",
    green: "bg-gradient-to-br from-green-50 to-emerald-100",
    red: "bg-gradient-to-br from-red-50 to-rose-100",
    yellow: "bg-gradient-to-br from-yellow-50 to-amber-100",
    orange: "bg-gradient-to-br from-orange-50 to-amber-100",
    purple: "bg-gradient-to-br from-purple-50 to-indigo-100",
  };

  return (
    <div
      className={`flex h-48 justify-between items-center ${gradients[color] || "bg-white"} rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200`}
    >
      {/* Left section */}
      <div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="space-y-1">
          <p className="text-base font-bold text-blue-700">Male: {male}</p>
          <p className="text-base font-bold text-pink-700">Female: {female}</p>
        </div>
      </div>

      {/* Right section - Total + Icon */}
      <div className="flex flex-col items-center justify-center text-right">
        <div
          className={`flex items-center justify-center w-16 h-16 rounded-full bg-white/60 mb-3`}
        >
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>
        <p className="text-5xl font-extrabold text-gray-800 leading-none">{total}</p>
        <p className="text-sm font-medium text-gray-500 mt-1">Total</p>
      </div>
    </div>
  );
};
