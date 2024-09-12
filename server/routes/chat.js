const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversationSchema');
const Chat = require('../models/chtasSchema');
const {auth} = require('../middlewares/auth');
const { searchUsers } = require('../controllers/chats');
const mongoose = require('mongoose');
const { getIO } = require('../socketIO/socket');
const ObjectId = mongoose.Types.ObjectId;

// Create or get a conversation
router.post('/conversation', auth, async (req, res) => {
console.log("first")
  
    const { participantId } = req.body;
    const userId = req.user.id;
  
    if (!participantId) {
      return res.status(400).json({ message: 'participantId is required.' });
    }
  
    try {
      let conversation = await Conversation.findOne({
        participants: { $all: [userId, participantId] }
      });
  
      if (!conversation) {
        conversation = new Conversation({
          participants: [userId, participantId]
        });
        await conversation.save();
      }
  
      res.status(200).json(conversation);
    } catch (error) {
      res.status(500).json({ message: 'Error creating or fetching conversation', error });
    }
});

const getUserConversations = async (req, res) => {
  const userId = req.user.id; // User ID as a string

  try {
    // Fetch conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).populate({
        path: 'participants',
  select: 'name image'
    }); // Assuming participants have 'name' field

    // Extract conversation IDs
    const conversationIds = conversations.map(conv => conv._id);

    // Fetch chats related to these conversations
    const chats = await Chat.find({
      conversationId: { $in: conversationIds }
    });

    // Compute unread counts manually
    const conversationsWithUnreadCounts = conversations.map(conv => {
      const conversationChats = chats.filter(chat => chat.conversationId.toString() === conv._id.toString());
      const unreadCount = conversationChats.filter(chat => !chat.read && chat.sender.toString() !== userId).length;
      return {
        ...conv._doc, // Include conversation fields
        unreadCount
      };
    });

    res.status(200).json(conversationsWithUnreadCounts);
  } catch (error) {
    console.error('Error fetching conversations:', error); // Log the full error for debugging
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};




router.get('/conversations', auth, getUserConversations);

// Get messages in a conversation
router.get('/messages/:conversationId', auth, async (req, res) => {
  const { conversationId } = req.params;
  const { id: userId } = req.user; // Current user's ID

  try {
    // Fetch and sort the messages by creation time
    const messages = await Chat.find({ conversationId }).populate({path:'sender' , select:"name image"}).sort({ createdAt: 1 });

    // Update all unread messages to read, except for the ones sent by the current user
    await Chat.updateMany(
      { conversationId, read: false, sender: { $ne: userId } }, // Exclude user's own messages
      { $set: { read: true } }
    );

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



router.get('/serach',searchUsers)

module.exports = router;
