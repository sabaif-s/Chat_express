const mongoose = require('mongoose');

const ChatRoomSchema = new mongoose.Schema({
    roomName: {
        type: String,
        required: true,
        unique: true
    },
    joinUser: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    link:{
        type:String,
        required:true
    }
});

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports = ChatRoom;