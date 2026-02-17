const db = require("../config/db");

// controllers/submitQuiz.controller.js

exports.submitQuizAnswers = async (req, res) => {
  const { quiz_id } = req.params;
  const answers = req.body; // now receiving direct array
  const userId = req.user.userId;

  if (!quiz_id) {
    return res.status(400).json({ message: "quiz_id is required" });
  }

  if (!Array.isArray(answers) || answers.length === 0) {
    return res.status(400).json({
      message: "answers must be an array of {option_id, user_submit_ans}",
    });
  }

  try {
    /* 1️⃣ CHECK QUIZ EXISTS */
    const quizResult = await db.query(
      `SELECT id FROM quizzes
       WHERE id = $1 AND is_active = true`,
      [quiz_id],
    );

    if (quizResult.rows.length === 0) {
      return res.status(404).json({
        message: "Quiz not found or inactive",
      });
    }

    /* 2️⃣ FETCH ALL OPTIONS OF THIS QUIZ */
    const { rows: options } = await db.query(
      `SELECT id, question, option_text, correct_ans
       FROM quiz_options
       WHERE quiz_id = $1`,
      [quiz_id],
    );

    if (options.length === 0) {
      return res.status(404).json({
        message: "No options found for this quiz",
      });
    }

    /* 3️⃣ CREATE MAP USING OPTION_ID */
    const optionMap = new Map();

    options.forEach((opt) => {
      optionMap.set(opt.id, opt);
    });
    console.log("Option Map:", optionMap);
    /* 3️⃣ EVALUATE PER QUESTION */

    let correct = 0;
    let wrong = 0;

    const evaluation = [];

    for (const ans of answers) {
      const selectedOption = optionMap.get(ans.option_id);

      if (!selectedOption) {
        wrong++;
        continue;
      }

      // find correct option for same question
      const correctOption = options.find(
        (opt) =>
          opt.question === selectedOption.question &&
          opt.correct_ans === opt.option_text,
      );

      const isCorrect = selectedOption.correct_ans === ans.user_submit_ans;

      if (isCorrect) correct++;
      else wrong++;

      evaluation.push({
        question: selectedOption.question,
        options: selectedOption.option_text,
        user_answer: ans.user_submit_ans,
        correct_answer: selectedOption.correct_ans,
        is_correct: isCorrect,
      });
    }

    const score = correct;

    /* 4️⃣ UPSERT SUBMISSION */
    await db.query(
      `INSERT INTO quiz_submissions
       (quiz_id, user_id, total_questions,
        correct_answers, wrong_answers,
        score, answers, evaluation)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
       ON CONFLICT (quiz_id, user_id)
       DO UPDATE SET
         total_questions = EXCLUDED.total_questions,
         correct_answers = EXCLUDED.correct_answers,
         wrong_answers   = EXCLUDED.wrong_answers,
         score           = EXCLUDED.score,
         answers         = EXCLUDED.answers,
         evaluation      = EXCLUDED.evaluation,
         submitted_at    = CURRENT_TIMESTAMP`,
      [
        quiz_id,
        userId,
        answers.length,
        correct,
        wrong,
        score,
        JSON.stringify(answers),
        JSON.stringify(evaluation),
      ],
    );

    /* 5️⃣ RESPONSE */
    return res.status(200).json({
      message: "Quiz submitted successfully",
      result: {
        quiz_id,
        total_questions: answers.length,
        correct_answers: correct,
        wrong_answers: wrong,
        score,
      },
    });
  } catch (error) {
    console.error("submitQuizAnswers error:", error);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
};

exports.getAllQuizSubmissions = async (req, res) => {
  const result = await db.query(
    `SELECT
      qs.id,
      u.id AS user_id,
      u.email,
      u.name,
      u.kyc_status,
      u.profile_picture_url,
      q.id AS quiz_id,
      q.title AS quiz_title,
      q.status AS quiz_status,
      qs.score,
      qs.total_questions,
      qs.submitted_at
    FROM quiz_submissions qs
    JOIN users u ON u.id = qs.user_id
    JOIN quizzes q ON q.id = qs.quiz_id
    ORDER BY qs.submitted_at DESC
    `,
  );

  res.json({
    message: "Quiz submissions fetched successfully",
    submissions: result.rows,
  });
};

// req.user.id comes from JWT / auth middleware
exports.getMyQuizSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId || req.user.userId;

    const result = await db.query(
      `SELECT
        qs.id,
        u.id AS user_id,
        u.email,
        q.id AS quiz_id,
        q.title AS quiz_title,
        q.status AS quiz_status,
        qs.score,
        qs.total_questions,
        qs.submitted_at
      FROM quiz_submissions qs
      JOIN users u ON u.id = qs.user_id
      JOIN quizzes q ON q.id = qs.quiz_id
      WHERE qs.user_id = $1
      ORDER BY qs.submitted_at DESC
      `,
      [userId],
    );

    res.json({
      message: "My quiz submissions fetched successfully",
      submissions: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getQuizSubmissionDetails = async (req, res) => {
  const { id } = req.params;

  const result = await db.query(
    `
    SELECT
      qs.total_questions,
      qs.correct_answers,
      qs.wrong_answers,
      qs.score,
      qs.evaluation,
      q.status AS quiz_status
    FROM quiz_submissions qs
    JOIN quizzes q ON q.id = qs.quiz_id
    WHERE qs.id = $1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "Submission not found" });
  }

  const submission = result.rows[0];

  res.json({
    message: "Quiz submitted successfully",
    quiz_status: submission.quiz_status, // ✅ ACTIVE | PROCESSING | COMPLETED
    total_questions: submission.total_questions,
    correct_answers: submission.correct_answers,
    wrong_answers: submission.wrong_answers,
    score: submission.score,
    options: submission.evaluation,
  });
};
