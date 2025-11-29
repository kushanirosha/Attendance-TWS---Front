import { useState, useEffect } from 'react';
import { LogOut, Maximize, Minimize } from 'lucide-react';
import { formatSriLankanDateTime } from '../utils/dateUtils';
import logo from "../public/logo.png";
import toast from 'react-hot-toast';

interface HeaderProps {
  userName: string;
  userRole: string;

}

export const Header = ({  }: HeaderProps) => {
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

  const handleLogout = () => {
    sessionStorage.removeItem('user');
    toast.success('Logged out successfully');
    window.location.href = '/login';
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white shadow-md z-50 border-b border-gray-200">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img src={logo} className='h-10 w-10' />
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

          {!isFullscreen && (
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}

        </div>
      </div>
    </header>
  );
};
