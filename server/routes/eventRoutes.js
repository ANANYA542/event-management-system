const express = require("express");
const router = express.Router();

const {createEvent,getEventsByUser,updateEvent,getEventLogs} = require("../controllers/eventController");


router.post("/", createEvent);
router.get("/", getEventsByUser);
router.put("/:eventId",updateEvent);
router.get("/logs",getEventLogs);

module.exports = router;
