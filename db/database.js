const mongoose = require("mongoose");

// Replace the URI with your MongoDB connection string
const mongoURI = "mongodb+srv://sebaifmuhammed4798:sabaifNewPassword@sabaif0.1pawt.mongodb.net/chat_app"; // For local MongoDB
// Example for cloud MongoDB: 'mongodb+srv://<username>:<password>@cluster.mongodb.net/<dbname>'

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export const db = mongoose.connection;

db.on("error", console.error.bind(console, "MongoDB connection error:"));
db.once("open", () => {
  console.log("MongoDB connected successfully!");
});
