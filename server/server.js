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

dotenv.config();
database.connect();
const app = express();
const PORT = process.env.PORT || 4000;

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

// Test route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Your server is up and running ...',
  });
});

// Socket.IO connection
io.on('connection', (socket) => {
  console.log('New client connected', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected', socket.id);
  });
});





// Start server and Socket.IO
server.listen(PORT, () => {
  console.log(`App is listening at ${PORT}`);
});
