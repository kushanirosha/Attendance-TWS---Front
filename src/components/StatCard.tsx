import React from "react";

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ElementType;
  color: string;
}

export const StatCard = ({ title, value, subtitle, icon: Icon, color }: StatCardProps) => {
  const isGenderFormat = value.includes("M:") && value.includes("F:");
  const isNumberOnly = /^\d+$/.test(value.trim());

  let male = 0;
  let female = 0;
  let total = 0;

  if (isGenderFormat) {
    const match = value.match(/M:\s*(\d+)\s*\|\s*F:\s*(\d+)/);
    if (match) {
      male = parseInt(match[1]);
      female = parseInt(match[2]);
      total = male + female;
    }
  } else if (isNumberOnly) {
    total = parseInt(value);
  }

  const gradients: Record<string, string> = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100",
    green: "bg-gradient-to-br from-green-50 to-emerald-100",
    red: "bg-gradient-to-br from-red-50 to-rose-100",
    yellow: "bg-gradient-to-br from-yellow-50 to-amber-100",
    orange: "bg-gradient-to-br from-orange-50 to-amber-100",
    purple: "bg-gradient-to-br from-purple-50 to-indigo-100",
  };

  const gradient = gradients[color] || "bg-gradient-to-br from-gray-50 to-gray-100";

  return ( 
    <div
      className={`flex h-48 justify-between items-center ${gradient} rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all duration-200`}
    >
      <div className="flex-1">
        <h3 className="text-xl font-semibold text-gray-700 mb-3">{title}</h3>

        {isGenderFormat && (
          <div className="space-y-1">
            <p className="text-base font-bold text-blue-700">Male: {male}</p>
            <p className="text-base font-bold text-pink-700">Female: {female}</p>
          </div>
        )}

        {isNumberOnly && (
          <div className="space-y-1">
            <p className="text-5xl font-extrabold text-gray-800 leading-none">{total}</p>
            {subtitle && <p className="text-sm font-medium text-gray-600 mt-1">{subtitle}</p>}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center justify-center">
        <div className="flex items-center justify-center w-16 h-16 rounded-full bg-white/60 mb-3">
          <Icon className={`w-8 h-8 text-${color}-600`} />
        </div>

        {isGenderFormat && (
          <>
            <p className="text-5xl font-extrabold text-gray-800 leading-none">{total}</p>
            <p className="text-sm font-medium text-gray-500 mt-1">Total</p>
          </>
        )}
      </div>
    </div>
  );
};