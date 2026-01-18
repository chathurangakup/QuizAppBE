const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../utils/auth.middleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Route to get phone, email, and name
router.get("/user-details", auth, authController.getUserDetails);

// Route to update user details
router.put("/user-details/:id", auth, authController.updateUserDetails);

module.exports = router;
