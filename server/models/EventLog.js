const mongoose = require("mongoose");

const eventLogSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },

  changedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  oldValues: {
    type: Object,
    required: true,
  },

  newValues: {
    type: Object,
    required: true,
  },

  changedAtUTC: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EventLog", eventLogSchema);
