import { useEffect } from 'react';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setToken } from '../slices/authSlice';
import { setSessionID, setUser } from '../slices/profileSlice';
import Swal from 'sweetalert2'; // Import SweetAlert2
import toast from 'react-hot-toast';

const useSocket = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { sessionID } = useSelector(state => state.profile);
const BASE_URL = 'https://photomanagerbyvikash.vercel.app'
// const BASE_URL = 'http://localhost:4000/'
  
  useEffect(() => {
    const socket = io(BASE_URL); // Update with your server URL

    socket.on('logout', ({ sessionId, message }) => {
      if (sessionID === sessionId) {
        // Clear the state and localStorage
        dispatch(setToken(null));
        dispatch(setUser(null));
        dispatch(setSessionID(null));
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        
        // Show SweetAlert2 popup
        Swal.fire({
          icon: 'warning',
          title: 'Logged Out',
          text: 'You logged out from another device.',
          confirmButtonText: 'OK'
        }).then(() => {
          // Redirect after the popup is closed
          navigate('/');
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [navigate, sessionID, dispatch]);

  return null;
};

export default useSocket;
