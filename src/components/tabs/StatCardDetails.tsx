import { AlertCircle } from 'lucide-react';

export const StatCardDetails = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center space-y-4">
      <AlertCircle className="w-16 h-16 text-yellow-500 animate-pulse" />
      <h2 className="text-2xl font-bold text-gray-800">
        Ooph! Sorry.
      </h2>
      <p className="text-lg text-gray-600">
        This feature is <span className="font-medium text-blue-600">under development</span>.<br />
        It will be available soon.
      </p>
    </div>
  );
};