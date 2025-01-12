const express = require('express');
const ChatRoom = require('../models/ChatRoom'); // Adjust the path as necessary

const router = express.Router();
const generateRandomString=async ()=>{
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    const length = 10;

    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}
router.post('/', async (req, res) => {
    const { joinUser, password, roomName } = req.body;

    if (!joinUser || !password || !roomName) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const randomLinkGenerate=await generateRandomString();
        console.log(randomLinkGenerate);
        const generatedLink=`http://localhost:3000/room/${randomLinkGenerate}`
        const newChatRoom = new ChatRoom({
            joinUser,
            password,
            roomName,
            link:generatedLink
        });

        await newChatRoom.save();
        res.status(201).json({ message: 'Chat room created successfully', chatRoom: newChatRoom });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

module.exports = router;