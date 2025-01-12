const express = require('express');
const ChatRoom = require('../models/ChatRoom'); // Adjust the path as necessary

const router = express.Router();

router.post('/', async (req, res) => {
    const { joinUser, password, roomName } = req.body;

    try {
        const room = await ChatRoom.findOne({ roomName });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        if (room.password != password || room.joinUser != joinUser) {
            return res.status(401).json({ message: 'Incorrect Credentials' });
        }

        return res.status(200).json({ message: 'Access granted', room });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;