const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Route for creating a new quiz
router.post("/create", quizController.createQuiz);

// Route for creating a new quiz with additional fields
router.post("/create-with-details", quizController.createQuizWithDetails);

// Route for editing an existing quiz by ID
router.put("/edit/:id", quizController.editQuizById);
router.put("/:id/status", auth, admin, quizController.updateQuizStatus);
router.get("/all", quizController.getAllQuizzes);

// Route to get all quizzes with user submission status
router.get("/all/user", auth, quizController.getAllQuizzesWithUserStatus);

module.exports = router;
