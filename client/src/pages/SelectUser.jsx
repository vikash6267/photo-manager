import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';

const ConversationList = ({ onConversationSelect,onUserSelect }) => {
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
        console.log(data);
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
          // onClick={() => onConversationSelect(conversation)}
        >
          {conversation.participants
            .filter(p => p._id !== user._id) // Exclude current user
            .map(participant => (
              <div key={participant._id} className="text-gray-700" onClick={() => onUserSelect(participant._id)}>
                {participant.name}
              </div>
            ))}
        </div>
      ))}
    </div>
  );
};

export default ConversationList;
