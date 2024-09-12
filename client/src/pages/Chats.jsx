import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import { useSelector } from 'react-redux';

const socket = io('http://localhost:4000');

const Chat = ({ receiverId, onClose }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const [conversationId, setConversationId] = useState(null);
 
 
  const fetchMessages = async () => {
    if (conversationId) {
      try {
        const { data } = await axios.get(
          `http://localhost:4000/api/v1/chat/messages/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(data);

        // Find the recipient's name based on the messages
        const recName = data.find((msg) => msg.sender._id !== user._id);
        if (recName) {
          setReceiver(recName.sender); // Set the receiver's details
        }
      } catch (error) {
        console.error('Error fetching messages:', error);
      }
    }
  };
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data } = await axios.post(
          'http://localhost:4000/api/v1/chat/conversation',
          { participantId: receiverId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversationId(data._id);
        socket.emit('joinConversation', data._id);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

  

    fetchConversation();
    fetchMessages();
  }, [conversationId, token, user._id]);

  useEffect(() => {
    socket.on('displayTyping', ({ userId }) => {
      setTypingUser(userId);
    });

    socket.on('removeTyping', ({ userId }) => {
      if (typingUser === userId) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off('displayTyping');
      socket.off('removeTyping');
    };
  }, [typingUser]);

  useEffect(() => {
    socket.on('receiveMessage', (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        // setMessages((prevMessages) => [...prevMessages, newMessage]);
        fetchMessages()
      }
    });
  }, [conversationId]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!typingUser) {
      socket.emit('typing', conversationId, user._id);
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit('stopTyping', conversationId, user._id);
    }, 3000);
  };

  const sendMessage = async () => {
    try {
      socket.emit('sendMessage', { conversationId, sender: user._id, message });
      setMessage('');
      socket.emit('stopTyping', conversationId, user._id);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 z-50">
      <div className="bg-white w-80 h-96 rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-blue-600 text-white">
          <h2 className="text-lg font-semibold">
            {receiver ? receiver.name : 'Chat'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-2 flex ${
                msg.sender._id === user._id ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`p-2 rounded-lg max-w-xs ${
                  msg.sender._id === user._id
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-300 text-black'
                }`}
              >
                {msg.message}
              </div>
            </div>
          ))}
          {typingUser && typingUser !== user._id && (
            <div className="italic text-sm text-gray-500">
              Typing...
            </div>
          )}
        </div>
        <div className="flex p-4 border-t bg-gray-200">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            className="flex-1 border rounded-lg px-4 py-2"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
