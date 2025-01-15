const express = require('express');
const ChatRoom = require('../models/ChatRoom'); // Adjust the path as necessary

const router = express.Router();

// Function to generate random string
const generateRandomString = async () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const length = 10;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
};

// Route to create a new chat room
router.post('/', async (req, res) => {
  const { joinUser, password, roomName } = req.body;

  // Validate input
  if (!joinUser || !password || !roomName) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  try {
    // Check if a room with the same name already exists (assuming roomName should be unique)
    const existingRoom = await ChatRoom.findOne({ roomName });
    if (existingRoom) {
      return res.status(400).json({ message: 'Room name already taken' });
    }

    // Generate a unique link
    const randomLinkGenerate = await generateRandomString();
    const generatedLink = `http://localhost:3000/room/${randomLinkGenerate}`;

    // Create a new chat room
    const newChatRoom = new ChatRoom({
      joinUser,
      password,
      roomName,
      link: generatedLink,
    });

    // Save the chat room to the database
    await newChatRoom.save();

    // Respond with success
    res.status(201).json({ message: 'Chat room created successfully', chatRoom: newChatRoom });
  } catch (error) {
    // Handle MongoDB unique constraint violation (for example, if the link is already taken)
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Duplicate key error: room link already exists' });
    }

    // Handle general server errors
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
