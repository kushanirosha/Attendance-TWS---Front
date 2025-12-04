import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:3000';

export const useRealtimeDashboard = () => {
  const [dashboard, setDashboard] = useState({
    stats: null,
    logs: [],
    loading: true
  });

  useEffect(() => {
    const socket = io(WS_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
    });

    socket.on('connect', () => console.log('Live dashboard connected'));
    socket.on('connect_error', (err) => console.error('WS Error:', err));

    socket.on('dashboard-update', (data) => {
      setDashboard({
        stats: data.stats,
        logs: data.logs,
        loading: false
      });
    });

    return () => socket.disconnect();
  }, []);

  return dashboard;
};