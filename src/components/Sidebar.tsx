import { LayoutDashboard, Users, Calendar, UserCog, ChevronRight, ChevronLeft, Folder, BarChart3, FileText } from 'lucide-react';
import { TabType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { Footer } from './Footer';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'statCardDetails' as TabType, label: 'Stat Card Details', icon: BarChart3 },
    { id: 'employees' as TabType, label: 'Employees', icon: Users },
    { id: 'shiftAssign' as TabType, label: 'Shift Assign', icon: Calendar },
    { id: 'projects' as TabType, label: 'Projects', icon: Folder },
    { id: 'reports' as TabType, label: 'Reports', icon: FileText },
    { id: 'users' as TabType, label: 'Users', icon: UserCog },
  ];

  return (
    <>
      <button
        onClick={onToggle}
        className="fixed left-0 top-20 z-40 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-lg shadow-lg transition-colors"
      >
        {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed left-0 top-16 bottom-0 w-64 bg-white shadow-lg z-30 border-r border-gray-200"
          >
            <nav className="p-4 space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;

                return (
                  <button
                    key={tab.id}
                    onClick={() => onTabChange(tab.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${isActive
                        ? 'bg-blue-500 text-white shadow-md'
                        : 'text-gray-700 hover:bg-gray-100'
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </motion.aside>
        )}
      </AnimatePresence>

      <Footer/>
    </>
  );
};
