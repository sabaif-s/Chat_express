const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
    
    messages: 
        {
            sender: {
                type: String,
                required: true
            },
            room: {
                type: String,
                required: true
            },
            message: [
                {
                    content: {
                        type: String,
                        required: true,
                    },
                    timestamp: {
                        type: Date,
                        default: Date.now,
                    },
                },
            ],
            timestamp: {
                type: Date,
                default: Date.now
            }
        }
});

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;