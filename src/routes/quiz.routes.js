const express = require("express");
const router = express.Router();
const quizController = require("../controllers/quiz.controller");

// Route for creating a new quiz
router.post("/create", quizController.createQuiz);

// Route for creating a new quiz with additional fields
router.post("/create-with-details", quizController.createQuizWithDetails);

// Route for editing an existing quiz by ID
router.put("/edit/:id", quizController.editQuizById);
router.patch("/:id/status", quizController.updateQuizStatus);
router.get("/all", quizController.getAllQuizzes);

module.exports = router;
