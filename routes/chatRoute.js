const express = require('express');
const Message = require('../models/Message'); // Adjust the path as necessary

const router = express.Router();
const getSortedMessages = async (room) => {
    try {
        const sortedMessages = await Message.aggregate([
            { $match: { "messages.room": room } }, // Filter by room
            { $unwind: "$messages.message" },     // Deconstruct the `message` array
            { $sort: { "messages.message.timestamp": 1 } }, // Sort by `timestamp`
        ]);

        console.log('Sorted messages:', sortedMessages);
        return sortedMessages;
    } catch (err) {
        console.error('Error sorting messages:', err);
        throw err;
    }
};
// GET request to fetch all messages
router.get(`/messages/:room`, async (req, res) => {
    const { room } = req.params;
    try {
        const messages = await getSortedMessages(room);
        const arrayObject=messages.map((item)=> {
            return {
                sender:item.messages.sender,
                message:item.messages.message.content
            }
        })
        console.log(arrayObject);
        res.status(200).json(arrayObject);
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

module.exports = router;