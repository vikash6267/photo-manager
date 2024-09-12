import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ConversationList = ({ onConversationSelect, onUserSelect }) => {
  const [conversations, setConversations] = useState([]);
  const { token } = useSelector(state => state.auth);
  const { user } = useSelector(state => state.profile);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data } = await axios.get('http://localhost:4000/api/v1/chat/conversations', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [token]);

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow-md">
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
                className={`flex items-center space-x-3 ${conversation.unreadCount > 0 ? "font-bold" : ""}`}
                onClick={() => onUserSelect(participant._id)}
              >
                <img
                  src={participant.image || 'default-avatar.png'} // Replace with a default avatar if image is not available
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
