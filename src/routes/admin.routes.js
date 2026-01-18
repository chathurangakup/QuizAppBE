const express = require("express");
const router = express.Router();
const adminController = require("../controllers/admin.controller.js");

// POST route to add admin user data
router.post("/admin-users", adminController.addAdminUser);
router.post("/admin-login", adminController.adminLogin);

module.exports = router;
