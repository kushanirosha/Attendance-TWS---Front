import { AlertTriangle } from 'lucide-react';

export const Reports = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center space-y-4">
      <AlertTriangle className="w-16 h-16 text-orange-500 animate-pulse" />
      <h2 className="text-2xl font-bold text-gray-800">
        Ooph! Sorry.
      </h2>
      <p className="text-lg text-gray-600">
        Reports are <span className="font-medium text-blue-600">under development</span>.<br />
        They will be available soon.
      </p>
    </div>
  );
};