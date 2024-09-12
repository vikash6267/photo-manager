const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { setIO } = require('./socketIO/socket'); // Import the utility
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const fileUpload = require('express-fileupload');
const database = require('./config/database');
const { cloudinaryConnect } = require('./config/cloudinary');
const imageRoute = require('./routes/imageRoute');
const userRoute = require('./routes/userRoute');
const folderRoute = require('./routes/folderRoute');
const chatRoutes = require("./routes/chat");
dotenv.config();
database.connect();
const app = express();
const PORT = process.env.PORT || 4000;
const Chat = require("./models/chtasSchema")
// Create HTTP server and integrate Socket.IO
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3000","https://photomanagerbyvikash.vercel.app",],
    methods: ["GET", "POST"],
  },
});

// Set the Socket.IO instance
setIO(io);

// Middleware setup
app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: ["http://localhost:3000", "https://photomanagerbyvikash.vercel.app"],
  credentials: true,
}));

app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// Connect to Cloudinary
cloudinaryConnect();

// API routes
app.use('/api/v1/user', userRoute);
app.use('/api/v1/folder', folderRoute);
app.use('/api/v1/image', imageRoute);
app.use("/api/v1/chat", chatRoutes);
// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Your server is up and running ...',
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('joinConversation', (conversationId) => {
    socket.join(conversationId);
  });

  socket.on('typing', (conversationId, userId) => {
    console.log("typing")
    socket.to(conversationId).emit('displayTyping', { userId });
  });


  
  socket.on('stopTyping', (conversationId, userId) => {
    socket.to(conversationId).emit('removeTyping', { userId });
  });

  socket.on('sendMessage', async(messageData) => {
    const { conversationId, sender, message } = messageData;

       const newMessage = new Chat({ conversationId, sender, message });
       await newMessage.save();
    io.to(conversationId).emit('receiveMessage', {
      conversationId,
      sender,
      message,
    });
  });

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
})


// Start server and Socket.IO
server.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
