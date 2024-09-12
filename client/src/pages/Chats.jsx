import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import axios from "axios";
import { useSelector } from "react-redux";

const socket = io("https://photomanager.mahitechnocrafts.in");

const Chat = ({ receiverId, onClose }) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState(null);
  const [receiver, setReceiver] = useState(null);
  const { user } = useSelector((state) => state.profile);
  const { token } = useSelector((state) => state.auth);
  const [conversationId, setConversationId] = useState(null);

  // Reference for the messages container
  const messagesEndRef = useRef(null);

  const fetchMessages = async () => {
    if (conversationId) {
      try {
        const { data } = await axios.get(
          `https://photomanager.mahitechnocrafts.in/api/v1/chat/messages/${conversationId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(data);

        // Find the recipient's name based on the messages
        const recName = data.find((msg) => msg.sender._id !== user._id);
        if (recName) {
          setReceiver(recName); // Set the receiver's details
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    }
  };

  useEffect(() => {
    const fetchConversation = async () => {
      try {
        const { data } = await axios.post(
          "https://photomanager.mahitechnocrafts.in/api/v1/chat/conversation",
          { participantId: receiverId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setConversationId(data._id);
        socket.emit("joinConversation", data._id);
      } catch (error) {
        console.error("Error fetching conversation:", error);
      }
    };

    fetchConversation();
    fetchMessages();
  }, [conversationId, token, user._id]);

  useEffect(() => {
    socket.on("displayTyping", ({ userId }) => {
      setTypingUser(userId);
    });

    socket.on("removeTyping", ({ userId }) => {
      if (typingUser === userId) {
        setTypingUser(null);
      }
    });

    return () => {
      socket.off("displayTyping");
      socket.off("removeTyping");
    };
  }, [typingUser]);

  useEffect(() => {
    socket.on("receiveMessage", (newMessage) => {
      if (newMessage.conversationId === conversationId) {
        fetchMessages();
      }
    });
  }, [conversationId]);

  useEffect(() => {
    // Scroll to the bottom when messages are updated
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleTyping = (e) => {
    setMessage(e.target.value);
    if (!typingUser) {
      socket.emit("typing", conversationId, user._id);
    }
    clearTimeout(window.typingTimeout);
    window.typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", conversationId, user._id);
    }, 3000);
  };

  const sendMessage = async () => {
    try {
      socket.emit("sendMessage", { conversationId, sender: user._id, message });
      setMessage("");
      socket.emit("stopTyping", conversationId, user._id);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-60 z-50">
      <div className="bg-white w-full max-w-lg h-3/4 rounded-lg shadow-lg flex flex-col">
        <div className="flex items-center justify-between p-4 border-b bg-blue-500 text-white rounded-t-lg">
          <div className="flex items-center gap-3">
            <img
              src={receiver?.sender?.image || 'default-avatar.png'}
              alt="Receiver"
              className="w-10 h-10 rounded-full object-cover"
            />
            <h2 className="text-xl font-semibold">
              {receiver ? receiver?.sender?.name : "Chat"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white text-2xl hover:text-gray-300"
          >
            &times;
          </button>
        </div>
        <div className="flex-1 p-4 overflow-y-auto bg-gray-100">
          {messages.map((msg) => (
            <div
              key={msg._id}
              className={`mb-3 flex ${msg.sender._id === user._id ? "justify-end" : "justify-start"}`}
            >
              <div className={`p-3 rounded-lg max-w-xs ${msg.sender._id === user._id ? "bg-blue-600 text-white" : "bg-gray-300 text-black"}`}>
                {msg.message}
                <div className={`text-xs ${msg.sender._id === user._id ? "text-right" : "text-left"}`}>
                  <div>{new Date(msg.createdAt).toLocaleString()}</div>
                  <div>{msg.read ? "Seen" : "Not Seen"}</div>
                </div>
              </div>
            </div>
          ))}
          {typingUser && typingUser !== user._id && (
            <div className="italic text-sm text-gray-500">Typing...</div>
          )}
          {/* Empty div to serve as the scroll target */}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex items-center p-4 border-t bg-white">
          <input
            type="text"
            value={message}
            onChange={handleTyping}
            className="flex-1 border rounded-lg px-4 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Type a message..."
          />
          <button
            onClick={sendMessage}
            className="ml-3 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-600"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
