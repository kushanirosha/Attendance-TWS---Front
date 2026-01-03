// src/components/Sidebar.tsx
import { useEffect, useState } from 'react';
import { LayoutDashboard, Users, Calendar, UserCog, ChevronRight, ChevronLeft, Folder, BarChart3, FileText } from 'lucide-react';
import { TabType } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { authService, User } from '../services/authService';

interface SidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const roleTabs = {
  super_admin: ['dashboard', 'statCardDetails', 'employees', 'shiftAssign', 'projects', 'reports', 'users'],
  stl: ['dashboard', 'statCardDetails','shiftAssign', 'projects'],
  admin: ['dashboard', 'statCardDetails', 'employees', 'shiftAssign', 'projects', 'reports'],
  user: ['dashboard'],
};

const allTabs = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'statCardDetails', label: 'Stat Card Details', icon: BarChart3 },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'shiftAssign', label: 'Shift Assign', icon: Calendar },
  { id: 'projects', label: 'Projects', icon: Folder },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'users', label: 'Users', icon: UserCog },
] as const;

export const Sidebar = ({ activeTab, onTabChange, isOpen, onToggle }: SidebarProps) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    setUser(authService.getUser());
  }, []);

  const allowedTabIds = user ? roleTabs[user.role] : [];
  const tabs = allTabs.filter(tab => allowedTabIds.includes(tab.id));

  return (
    <>
      {user?.role !== "user" && (
        <button
          onClick={onToggle}
          className="fixed left-0 top-20 z-40 bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-r-lg shadow-lg transition-colors"
        >
          {isOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
        </button>
      )}

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
    </>
  );
};