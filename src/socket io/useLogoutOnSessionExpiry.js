import io from 'socket.io-client';
import { useEffect } from 'react';

const socket = io('your-websocket-server-url');

const useLogoutOnSessionExpiry = () => {
  useEffect(() => {
    // Listen for logout event from server
    socket.on('logout', (data) => {
      console.log(data.message);
      // Perform client-side logout
      localStorage.removeItem('token');
      window.location.reload(); // Refresh the page or redirect the user
    });

    return () => {
      socket.off('logout');
    };
  }, []);
};

export default useLogoutOnSessionExpiry;
