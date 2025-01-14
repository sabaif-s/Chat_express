const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const registerRouter=require("./routes/registerRoute");
const createChatRouter=require("./routes/createRoute");
const chatRoomCheck=require("./routes/checkRoom");
const chatRoute=require("./routes/chatRoute");
const Message=require("./models/Message");
const Chat = require("./models/chat"); // Import the Chat model
const corsOptions = {
    origin: "http://localhost:3000",  // Specify the frontend URL explicitly
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"], // Custom headers
    credentials: true,  // Allow credentials (cookies, authorization headers, etc.)
  };
  app.use(cors(corsOptions));
app.use(bodyParser.json());
app.use("/register",registerRouter);
app.use("/createChat",createChatRouter);
app.use("/checkChat",chatRoomCheck);
app.use("/chat",chatRoute);
// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/chatApp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});


  
//   app.options('*', cors(corsOptions));

const db = mongoose.connection;
db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connected successfully!");

  // Example: Saving a new chat message
  const newChat = new Chat({
    username: "Alice",
    message: "Hello, world!",
  });

  newChat.save()
    .then(() => console.log("Chat message saved!"))
    .catch((err) => console.error("Error saving chat message:", err));
});
// Setup MongoDB Connection
 

// Chat Schema and Model
 

 app.get("/",(req,res)=>{
    res.send("in router");
 });

const io = new Server(server, {
    cors: {
        origin: "*",
    },
});

let count = 0;
const usersArray=[];
// Root namespace logic
io.on("connection", (socket) => {
    console.log("User is connected with:", socket.id);
    count += 1;
    console.log(`Active users: ${count}`);

    // Handle user1_message event
    socket.on("user1_clicked",(data)=>{
        console.log("user1_clicked:",data);
        socket.emit("register",{userID:socket.id,})
    })
    socket.on("user1_message", (data) => {
        console.log("User 1 message:", data);
        if (data.receiver == "userTwo") {
            // Sending a message back to the same socket
            if(usersArray.length > 0){
                socket.to(usersArray[1].id).emit("user1_message",data);
            }
            
             // Use `socket.emit` to send to the sender directly
        }
        else if(data.receiver == "userOne"){
            socket.to(usersArray[0].id).emit("user1_message",data);
        }
    });
    socket.on("register",(data)=>{
        const newObject={
            data:data,
            id:socket.id
        }
        usersArray.push(newObject);
        console.log(usersArray);
    })

    // Detect disconnection
    socket.on("disconnect", (reason) => {
        console.log(`User with socket ID ${socket.id} disconnected. Reason: ${reason}`);
        count -= 1;
        console.log(`Active users: ${count}`);
    });
});
const roomNamespace = io.of("/room");

roomNamespace.on("connection", (socket) => {
  console.log(`User connected to /room namespace: ${socket.id}`);

  // Join a room
  socket.on("joinRoom", (roomName) => {
    socket.join(roomName);
    console.log(`${socket.id} joined room: ${roomName}`);

    // Notify other users in the room
    roomNamespace.to(roomName).emit("message", `${socket.id} has joined the room`);
  });

  // Listen for messages in a room
  socket.on("message", ({ roomName, message }) => {
    console.log(`Message in room ${roomName}: ${message}`);
    roomNamespace.to(roomName).emit("message", { sender: socket.id, message });
  });

  // Handle disconnect
  socket.on("disconnect", () => {
    console.log(`User disconnected from /room namespace: ${socket.id}`);
  });
});

const insertMessage = async (sender, room, message) => {
    try {
        const newMessage = new Message({
            messages: {
                sender,
                room,
                message: [
                    {
                        content:message,
                        timestamp: new Date(),
                    },
                ],
                timestamp: new Date(),
            },
        });

        // Save to the database
        const savedMessage = await newMessage.save();
        console.log("Message saved:", savedMessage);
        return savedMessage; // Return the saved message
    } catch (err) {
        console.error("Error saving new message:", err);
        throw err; // Throw error to handle it in the caller
    }
};

const updateMessage = async (foundMessage, newMessage) => {
    try {
        foundMessage.messages.message.push({
            content: newMessage,
            timestamp: new Date(),
        });
        
        // Add the new message
        const updatedMessage = await foundMessage.save();
        console.log("Message updated:", updatedMessage);
        return updatedMessage; // Return the updated message
    } catch (err) {
        console.error("Error updating message:", err);
        throw err; // Throw error to handle it in the caller
    }
};

const chatNamespace = io.of("/chat");

chatNamespace.on("connection", (socket) => {
    console.log("User connected to /chat namespace:", socket.id);

    socket.on("send_message", async (data) => {
        console.log(`Message received in /chat: ${data.message}`);
        try {
            const foundMessage = await Message.findOne({
                "messages.room": data.room,
                "messages.sender": data.sender,
            });

            if (foundMessage) {
                await updateMessage(foundMessage, data.message);
            } else {
                await insertMessage(data.sender, data.room, data.message);
            }

            // Join the room and broadcast the message
            socket.join(data.room);
            socket.to(data.room).emit("new_message", data);
        } catch (err) {
            console.error("Error handling message:", err);
            socket.emit("error_message", { error: "Failed to handle message" }); // Notify the client about the error
        }
    });

    socket.on("register_chats", (data) => {
        console.log("Two users registered:", data);
    });

    socket.on("disconnect", () => {
        console.log(`User disconnected from /chat namespace: ${socket.id}`);
    });
});

server.listen(3001, () => {
    console.log("Server is running on port 3001");
});
