const express = require("express");
const router = express.Router();
const submitquizController = require("../controllers/submitquiz.controller");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

// Route for creating a new quiz
router.post("/:quiz_id/submit", auth, submitquizController.submitQuizAnswers);
router.get(
  "/getsubmitquiz",
  auth,
  admin,
  submitquizController.getAllQuizSubmissions,
);
router.get(
  "/my-quiz-submissions",
  auth,
  submitquizController.getMyQuizSubmissions,
);

router.get(
  "/getsubmitquiz/:id",
  auth,
  admin,
  submitquizController.getQuizSubmissionDetails,
);
module.exports = router;
