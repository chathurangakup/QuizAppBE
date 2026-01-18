const express = require("express");
const router = express.Router();
const qoptionsController = require("../controllers/qoptions.controller");

// Route for creating a new quiz option
router.post("/create", qoptionsController.createQuizOption);

// Route for fetching quiz options by quiz_id
router.get("/quiz/:quiz_id", qoptionsController.getQuizOptionsByQuizId);

module.exports = router;
