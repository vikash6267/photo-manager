const express = require('express');
const router = express.Router();
const Conversation = require('../models/conversationSchema');
const Chat = require('../models/chtasSchema');
const {auth} = require('../middlewares/auth');
const { searchUsers } = require('../controllers/chats');

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
  const userId = req.user.id;

  try {
    // Find conversations where the user is a participant
    const conversations = await Conversation.find({
      participants: userId
    }).populate('participants', 'name'); // Populate participants with their names

    res.status(200).json(conversations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching conversations', error });
  }
};

router.get('/conversations', auth, getUserConversations);

// Get messages in a conversation
router.get('/messages/:conversationId', auth, async (req, res) => {
  const { conversationId } = req.params;
  try {
    const messages = await Chat.find({ conversationId }).populate('sender', 'name').sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/serach',searchUsers)

module.exports = router;
