import { useState, useEffect } from 'react';
import { User, LogOut, Maximize, Minimize } from 'lucide-react';
import { formatSriLankanDateTime } from '../utils/dateUtils';
import logo from "../public/logo.png";

interface HeaderProps {
  userName: string;
  userRole: string;
  onLogout: () => void;
}

export const Header = ({ userName, userRole, onLogout }: HeaderProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-50 border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src= {logo} className='h-10 w-10'/>
          <div className="hidden md:block">
            <h1 className="text-xl font-bold text-gray-800">TWS ATTENDANCE DASHBOARD</h1>
          </div>
        </div>

        <div className="flex-1 flex justify-center">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-600">Sri Lanka Time</p>
            <p className="text-base font-semibold text-gray-800">{formatSriLankanDateTime(currentTime)}</p>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleFullscreen}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* <div className="hidden md:flex items-center space-x-3 px-4 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800">{userName}</p>
              <p className="text-xs text-gray-500">{userRole}</p>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Logout</span>
          </button> */}

        </div>
      </div>
    </header>
  );
};
