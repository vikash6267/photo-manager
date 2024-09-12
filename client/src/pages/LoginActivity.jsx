import React, { useEffect, useState } from 'react';
import { getSessions, logout, logoutSession } from '../service/operations/user';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

function LoginActivity() {
  const { sessionID } = useSelector(state => state.profile);
  const { token } = useSelector(state => state.auth);
  const [sessions, setSessions] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchSession = async () => {
    try {
      const response = await getSessions(token, sessionID);
      setSessions(response); // Adjust according to your API response structure
      console.log(response);
    } catch (error) {
      console.log(error);
    }
  };

  const adminLogout = async (sessionId) => {
    try {
      if (sessionID === sessionId) {
        await dispatch(logout(token, sessionID, navigate));
      } else {
        await logoutSession(token, sessionId);
        fetchSession(); // Refresh session list
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchSession();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Login Activity</h1>
      {sessions.length === 0 ? (
        <p>No login sessions found.</p>
      ) : (
        <table className="min-w-full bg-white border border-gray-200">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Device</th>
              <th className="py-2 px-4 border-b">IP Address</th>
              <th className="py-2 px-4 border-b">Location</th>
              <th className="py-2 px-4 border-b">Login Time</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map((session) => (
              <tr
                key={session.sessionId}
                className={session.sessionId === sessionID ? 'bg-green-100' : ''}
              >
                <td className="py-2 px-4 border-b">
                  {session.device} {session.sessionId === sessionID ? <span className="text-green-600 font-bold">(My Device)</span> : ''}
                </td>
                <td className="py-2 px-4 border-b">{session.ipAddress}</td>
                <td className="py-2 px-4 border-b">{session.location}</td>
                <td className="py-2 px-4 border-b">{new Date(session.loginTime).toLocaleString()}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => adminLogout(session.sessionId)}
                    className="bg-red-500 text-white px-4 py-2 rounded"
                  >
                    Logout
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default LoginActivity;
