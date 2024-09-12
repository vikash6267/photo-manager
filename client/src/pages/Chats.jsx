// Chat.js
import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';

const socket = io('http://localhost:4000');

const Chat = ({ receiverId, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
const {user} = useSelector(state=>state.profile)
const {token} = useSelector(state=>state.auth)
  useEffect(() => {
    const fetchConversation = async () => {
      try {

        const { data } = await axios.post('http://localhost:4000/api/v1/chat/conversation', { participantId: receiverId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
     
        setConversationId(data._id);
        socket.emit('joinConversation', data._id);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchConversation();
  }, [receiverId]);

  useEffect(() => {
    socket.on('receiveMessage', (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      }
    });

    const fetchMessages = async () => {
      if (conversationId) {
        try {
       
          const { data } = await axios.get(`http://localhost:4000/api/v1/chat/messages/${conversationId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          setMessages(data);
        } catch (error) {
          console.error('Error fetching messages:', error);
        }
      }
    };

    fetchMessages();
  }, [conversationId]);

  const sendMessage = async () => {
    try {
   
      socket.emit('sendMessage', { conversationId, sender: user._id, message });
      setMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Chat</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">&times;</button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto">
          {messages.map((msg) => (
            <div key={msg._id} className="mb-2">
              <strong>{msg.sender.name}:</strong> {msg.message}
            </div>
          ))}
        </div>
        <div className="flex p-4 border-t">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Type a message..."
          />
          <button onClick={sendMessage} className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg">Send</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
