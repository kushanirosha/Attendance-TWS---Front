import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  color: string;
}

export const StatCard = ({ title, value, icon: Icon, color }: StatCardProps) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600',
  }[color] || 'from-gray-500 to-gray-600';

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
    >
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
            <p className="text-3xl font-bold text-gray-900">{value}</p>
          </div>
          <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses} rounded-lg flex items-center justify-center shadow-lg`}>
            <Icon className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
