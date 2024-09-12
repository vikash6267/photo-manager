import io from 'socket.io-client';
import { useEffect } from 'react';
const BASE_URL = 'https://photomanagerbyvikash.vercel.app'
// const BASE_URL = 'http://localhost:4000'

const socket = io(BASE_URL);

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
