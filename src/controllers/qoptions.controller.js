const db = require("../config/db");

// Controller for creating a new quiz option
exports.createQuizOption = async (req, res) => {
  const { quiz_id, question, option_text, correct_ans } = req.body;

  if (!quiz_id || !question || !option_text || !correct_ans) {
    return res.status(400).json({
      message:
        "Quiz ID, question, option text, and correct answer are required.",
    });
  }

  try {
    // Ensure option_text is a valid JSON array
    const query = `INSERT INTO quiz_options (quiz_id, question, option_text, correct_ans) VALUES ($1, $2, $3, $4) RETURNING *;`;
    const values = [
      quiz_id,
      question,
      JSON.stringify(option_text),
      correct_ans,
    ];

    const result = await db.query(query, values);
    return res.status(201).json({
      message: "Quiz option created successfully.",
      option: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating quiz option:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

// Controller for fetching quiz options by quiz_id
exports.getQuizOptionsByQuizId = async (req, res) => {
  const { quiz_id } = req.params;

  if (!quiz_id) {
    return res.status(400).json({ message: "Quiz ID is required." });
  }

  try {
    const query = `
      SELECT
        id,
        quiz_id,
        question,
        option_text
      FROM quiz_options
      WHERE quiz_id = $1;
    `;
    const values = [quiz_id];

    const result = await db.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "No quiz options found for the given Quiz ID.",
      });
    }

    return res.status(200).json({
      message: "Quiz options fetched successfully.",
      options: result.rows,
    });
  } catch (error) {
    console.error("Error fetching quiz options:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};
