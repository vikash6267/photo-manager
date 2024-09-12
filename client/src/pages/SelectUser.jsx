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
        console.log(data)
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      }
    };

    fetchConversations();
  }, [token]);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold">Conversations</h2>
      {conversations.map(conversation => (
        <div
          key={conversation._id}
          className="p-2 border-b cursor-pointer hover:bg-gray-100"
         
        >
          {conversation.participants
            .filter(p => p._id !== user._id) // Exclude current user
            .map(participant => (
              <div key={participant._id} className={`${conversation.unreadCount > 0 ? "font-bold" : ""}`} onClick={() => onUserSelect(participant._id)}>
                {participant.name}
             <div >
             {conversation.unreadCount > 1 ? (
                  <span className="ml-2 text-red-500">2+ Unread Message</span>
                ) : conversation.unreadCount === 1 ? (
                  <span className="ml-2 text-red-500">1 Unread Message</span>
                ) :  (
                  <span className="ml-2 text-red-500">No Unread Message</span>
                )}

             </div>
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
