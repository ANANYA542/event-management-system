//updated index.js for deployment purpose
const express = require("express");
const cors = require("cors");
require("dotenv").config();

const mongoose = require("mongoose");
const userRoutes = require("../routes/userRoutes");
const eventRoutes = require("../routes/eventRoutes");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/events", eventRoutes);

app.get("/", (req, res) => {
  res.send("API is running");
});


let isConnected = false;

async function connectDB() {
  if (isConnected) return;

  await mongoose.connect(process.env.MONGO_URI);
  isConnected = true;
  console.log("MongoDB connected");
}

connectDB();


module.exports = app;
