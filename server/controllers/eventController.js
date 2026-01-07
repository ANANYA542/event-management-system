const Event = require("../models/Event");
const User = require("../models/User");
const { toUTC } = require("../utils/timezone");
const { fromUTC } = require("../utils/timezone");
const EventLog = require("../models/EventLog");


exports.createEvent = async (req, res) => {
  try {
    const {
      title,
      profiles,
      eventTimezone,
      startDateTime,
      endDateTime,
    } = req.body;

    
    if (
      !title ||
      !profiles ||
      profiles.length === 0 ||
      !eventTimezone ||
      !startDateTime ||
      !endDateTime
    ) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    
    const startUTC = toUTC(startDateTime, eventTimezone);
    const endUTC = toUTC(endDateTime, eventTimezone);


    if (endUTC <= startUTC) {
      return res.status(400).json({
        message: "End date/time must be after start date/time",
      });
    }

    const users = await User.find({ _id: { $in: profiles } });

    if (users.length !== profiles.length) {
      return res.status(400).json({
        message: "One or more profiles are invalid",
      });
    }

    const event = await Event.create({
      title,
      profiles,
      eventTimezone,
      startUTC,
      endUTC,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({
      message: "Failed to create event",
      error: error.message,
    });
  }
};
exports.getEventsByUser = async (req, res) => {
    try {
      const { userId } = req.query;
  
      if (!userId) {
        return res.status(400).json({
          message: "userId query parameter is required",
        });
      }
  
      
      const user = await User.findById(userId);
  
      if (!user) {
        return res.status(404).json({
          message: "User not found",
        });
      }
      const events = await Event.find({
        profiles: userId,
      }).populate("profiles", "name");

      const formattedEvents = events.map((event) => ({
        _id: event._id,
        title: event.title,
        profiles: event.profiles,
        eventTimezone: event.eventTimezone,
        startUTC: event.startUTC,
        endUTC: event.endUTC,
        createdAtUTC: event.createdAt,
        updatedAtUTC: event.updatedAt,
      }));

      res.status(200).json(formattedEvents);
    } catch (error) {
      res.status(500).json({
        message: "Failed to fetch events",
        error: error.message,
      });
    }
  };
  exports.updateEvent = async (req, res) => {
    try {
      const { eventId } = req.params;
      const {
        profiles,
        eventTimezone,
        startDateTime,
        endDateTime,
        actingUserId,
      } = req.body;
  
      if (!actingUserId) {
        return res.status(400).json({
          message: "actingUserId is required",
        });
      }
  
      const event = await Event.findById(eventId);
  
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
  
     
      if (!event.profiles.map(String).includes(actingUserId)) {
        return res.status(403).json({
          message: "You are not allowed to update this event",
        });
      }
  

      const oldValues = {
        profiles: [...event.profiles],
        eventTimezone: event.eventTimezone,
        startUTC: event.startUTC,
        endUTC: event.endUTC,
      };
  
      let updated = false;
  
     
      if (profiles) {
        event.profiles = profiles;
        updated = true;
      }
  
      if (eventTimezone) {
        event.eventTimezone = eventTimezone;
        updated = true;
      }
  
      
      if (startDateTime) {
        event.startUTC = toUTC(startDateTime, event.eventTimezone);
        updated = true;
      }
  
      
      if (endDateTime) {
        event.endUTC = toUTC(endDateTime, event.eventTimezone);
        updated = true;
      }
  
      if (!updated) {
        return res.status(400).json({
          message: "No valid fields provided for update",
        });
      }
  
      await event.save(); 

      const newValues = {
        profiles: [...event.profiles],
        eventTimezone: event.eventTimezone,
        startUTC: event.startUTC,
        endUTC: event.endUTC,
      };
  
      await EventLog.create({
        eventId: event._id,
        changedBy: actingUserId,
        oldValues,
        newValues,
      });
  
      res.status(200).json({
        message: "Event updated successfully",
      });
    } catch (error) {
      res.status(500).json({
        message: "Failed to update event",
        error: error.message,
      });
    }
  };
  

exports.getEventLogs = async (req, res) => {
  try {
    const { eventId, userTimezone } = req.query;

    if (!eventId || !userTimezone) {
      return res.status(400).json({
        message: "eventId and userTimezone are required",
      });
    }

    const logs = await EventLog.find({ eventId })
      .sort({ changedAtUTC: -1 })
      .populate("changedBy", "name");

    const formattedLogs = logs.map((log) => ({
      _id: log._id,
      timestamp: fromUTC(log.changedAtUTC, userTimezone),
      changedBy: log.changedBy
        ? { _id: log.changedBy._id, name: log.changedBy.name }
        : null,
      oldValues: log.oldValues,
      newValues: log.newValues,
    }));

    res.status(200).json(formattedLogs);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch logs",
      error: error.message,
    });
  }
};
