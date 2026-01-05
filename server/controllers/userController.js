const User = require("../models/User");


exports.createUser = async (req, res) => {
  try {
    const { name, timezone } = req.body;

 
    if (!name || !timezone) {
      return res.status(400).json({
        message: "Name and timezone are required",
      });
    }

    const user = await User.create({
      name,
      timezone,
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create user",
      error: error.message,
    });
  }
};


exports.getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch users",
      error: error.message,
    });
  }
};
