import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_API_URL


// const SOCKET_SERVER_URL = 'http://localhost:4000'; // Ensure this matches your server URL
const SOCKET_SERVER_URL = 'https://photomanager.mahitechnocrafts.in/'; // Ensure this matches your server URL
const socket = io(SOCKET_SERVER_URL, {
  withCredentials: true,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Socket connected:', socket.id);
});


socket.on('disconnect', () => {
  console.log('Disconnected from server');
});

// Example: Listen for events
socket.on('user-login', (data) => {
  console.log('User login event received:', data);
});



// socket.on('logout', ({ sessionId, message }) => {
//   // Clear local storage
//   console.log(sessionId)
//   localStorage.removeItem('token');
//   localStorage.removeItem('user');
//   localStorage.removeItem('sessionID');
  
//   // Redirect to login page or handle UI update
  
  
//   // Optionally show a message
//   console.log(message);
// });



export default socket;
