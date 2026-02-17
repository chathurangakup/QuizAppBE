const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.post("/register", authController.register);
router.post("/login", authController.login);

// Route to get phone, email, and name
router.get("/user-details", auth, authController.getUserDetails);

// Route to update user details
router.put("/user-details/:id", auth, authController.updateUserDetails);
router.get("/users", authController.getAllUsers);

module.exports = router;
