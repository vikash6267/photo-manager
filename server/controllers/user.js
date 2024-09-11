const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const asyncHandler = require("express-async-handler");
const Session = require("../models/sessionModel");
const {getIO } = require("../socketIO/socket");
const otpGenerator = require("otp-generator");
const getLocation = require("../utills/goeLocation");




function generateSessionId() {
  return otpGenerator.generate(32, { alphabets: true, specialChars: false });
}

function getClientIp(req) {
  let ipAddress = req.headers['x-forwarded-for'] || 
                  req.connection?.remoteAddress || 
                  req.socket?.remoteAddress || 
                  (req.connection?.socket ? req.connection.socket.remoteAddress : null);

  // Handle multiple IPs in the x-forwarded-for header
  if (ipAddress && ipAddress.includes(',')) {
      ipAddress = ipAddress.split(',')[0].trim();
  }

  // Handle IPv6 to IPv4 mapping if needed
  if (ipAddress && ipAddress.startsWith('::ffff:')) {
      ipAddress = ipAddress.substring(7);
  }

  return ipAddress || 'Unknown IP';
}


exports.signup = asyncHandler(async (req, res) => {
  try {
    // Destructure fields from the request body
    const { name, email, password, contactNumber } = req.body;

    // Check if All Details are there or not
    if (!name || !email || !password || !contactNumber) {
      return res.status(403).send({
        success: false,
        message: "All fields are required",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user in the database
    const user = await User.create({
      name,
      email,
      contactNumber,
      password: hashedPassword,
    });

    // Log in the user after signup
    const token = jwt.sign(
      { email: user.email, id: user._id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "24h",
      }
    );

    // Set cookie for token
    const options = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      httpOnly: true,
    };
    res.cookie("token", token, options);

    // Return success response
    return res.status(200).json({
      success: true,
      token,
      user,
      message: "User registered and logged in successfully",
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "User cannot be registered. Please try again.",
    });
  }
});

exports.login = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Please fill up all the required fields" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: "User not registered. Please sign up to continue" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      user.failedAttempts += 1;
      if (user.failedAttempts >= 5) {
        user.isBlocked = true;
        user.blockUntil = Date.now() + 24 * 60 * 60 * 1000; // Block for 24 hours
      }
      await user.save();
      return res.status(401).json({ success: false, message: "Invalid password. Try again" });
    }

    // Successful login, reset failed attempts
    user.failedAttempts = 0;
    user.isBlocked = false;
    user.blockUntil = null;

    const token = jwt.sign({ email: user.email, id: user._id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });

    const sessionId = generateSessionId();
    const device = req.headers['user-agent'];
    const ipAddress = await getClientIp(req);
    const location = await getLocation(ipAddress);

    // Save session to DB
    await Session.create({
      userId: user._id,
      device,
      location,
      loginTime: new Date(),
      sessionId,
      ipAddress,
    });

    // Save token and sessionId to response cookies
    const tokenOptions = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };

    const sessionOptions = {
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days
      httpOnly: true,
    };

    res.cookie("token", token, tokenOptions);
    res.cookie("sessionId", sessionId, sessionOptions);

    res.status(200).json({
      success: true,
      token,
      sessionId,
      user,
      message: "User login successful",
    });

    // Connect WebSocket and associate it with the sessionId
    const socket = getIO();
    socket.emit('user-login', { sessionId, message: 'User logged in successfully.' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Login failed. Please try again" });
  }
});


exports.fetchMyProfile = asyncHandler(async (req, res) => {
  try {
    // Get email and password from request body
    const id = req.user.id;

    const userDetails = await User.findById(id);

    // Find user with provided email
    const user = await User.findById(id);

    // If user not found with provided email
    if (!user) {
      // Return 401 Unauthorized status code with error message
      return res.status(401).json({
        success: false,
        message: `User is not Registered with Us Please SignUp to Continue`,
      });
    }

    return res.status(200).json({
      user,
      success: true,
      message: `Fetch Data Successfully`,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: `Error During fetch data`,
    });
  }
});



exports.logoutSession = async (req, res) => {
  const { sessionId } = req.body;
  const userId = req.user?.id; // Ensure req.user is populated correctly

  if (!sessionId) {
    return res.status(400).json({ success: false, message: 'Session ID required.' });
  }

  try {
    // Remove the session from the database
    const result = await Session.deleteOne({ userId, sessionId });
    if (result.deletedCount === 0) {
      return res.status(404).json({ success: false, message: 'Session not found.' });
    }

    // Notify all clients associated with this session
    const io = getIO();
    io.emit('logout', { sessionId, message: 'You have been logged out from another device.' });

    res.status(200).json({ success: true, message: 'Session logged out successfully.' });
  } catch (error) {
    console.error('Error logging out session:', error);
    res.status(500).json({ success: false, message: 'Error logging out session.' });
  }
};


exports.getSessions = async (req, res) => {
  const userId = req.user?.id; // Extract user ID from authenticated user info

  if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID required.' });
  }

  try {
      // Retrieve all sessions for the user
      const sessions = await Session.find({ userId });
      res.status(200).json({ success: true, sessions });
  } catch (error) {
      console.error('Error retrieving sessions:', error);
      res.status(500).json({ success: false, message: 'Error retrieving sessions.' });
  }
};
