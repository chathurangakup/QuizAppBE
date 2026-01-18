const express = require("express");
const router = express.Router();
const userDevicesController = require("../controllers/userDevices.controller");

// GET API for user_devices
router.get("/user-devices", userDevicesController.getUserDevices);

// POST API for user_devices (create or update)
router.post("/user-devices", userDevicesController.updateUserDevice);

module.exports = router;
