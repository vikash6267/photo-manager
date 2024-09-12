import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';

const ConversationList = ({ onConversationSelect, onUserSelect }) => {
  const [conversations, setConversations] = useState([]);
  const { token } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.profile);
  const [socket, setSocket] = useState(null);

  const fetchConversations = async () => {
    try {
      const { data } = await axios.get('https://photomanager.mahitechnocrafts.in/api/v1/chat/conversations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setConversations(data);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  useEffect(() => {
    // Connect to Socket.IO server
    const newSocket = io('https://photomanager.mahitechnocrafts.in/', {
      query: { token }, // Pass the auth token if required
    });
    setSocket(newSocket);

    // Clean up on component unmount
    return () => newSocket.close();
  }, [token]);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  useEffect(() => {
    if (socket) {
      // Listen for message read events
      socket.on('message_read', () => {
        fetchConversations(); // Update conversations when messages are read
      });

      // Listen for new message events
      socket.on('new_message', () => {
        fetchConversations(); // Update conversations when new messages are received
      });
    }
  }, [socket]);

  const onClickUser = async (id) => {
    onUserSelect(id);
    fetchConversations(); // Refresh the conversations after a user is selected
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md w-full">
      <h2 className="text-xl font-semibold mb-4">Conversations</h2>
      {conversations.map(conversation => (
        <div
          key={conversation._id}
          className="flex items-center p-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 rounded-lg"
        >
          {conversation.participants
            .filter(p => p._id !== user._id) // Exclude current user
            .map(participant => (
              <div
                key={participant._id}
                className={`flex items-center space-x-3 ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}
                onClick={() => onClickUser(participant._id)}
              >
                <img
                  src={participant.image} // Replace with a default avatar if image is not available
                  alt={participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="flex-1">
                  <div className="text-lg font-medium">{participant.name}</div>
                  <div className="text-sm text-gray-600">
                    {conversation.unreadCount > 1 ? (
                      <span className="text-red-500">2+ Unread Messages</span>
                    ) : conversation.unreadCount === 1 ? (
                      <span className="text-red-500">1 Unread Message</span>
                    ) : (
                      <span>No Unread Messages</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
