const db = require("../config/db");

// Controller for creating a new quiz
exports.createQuiz = async (req, res) => {
  const {
    title,
    description,
    image_url,
    total_questions,
    reward_amount,
    difficulty,
    deadline,
    created_by,
  } = req.body;

  if (
    !title ||
    !total_questions ||
    !reward_amount ||
    !difficulty ||
    !deadline ||
    !created_by
  ) {
    return res.status(400).json({
      message:
        "title, total_questions, reward_amount, difficulty, deadline, created_by are required",
    });
  }

  try {
    const query = `
      INSERT INTO quizzes
      (title, description, image_url, total_questions, reward_amount, difficulty, deadline, created_by)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;

    const values = [
      title,
      description || null,
      image_url || null,
      total_questions,
      reward_amount,
      difficulty,
      deadline,
      created_by,
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Create quiz error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller for creating a new quiz with additional fields
// Controller for creating a new quiz with additional fields
exports.createQuizWithDetails = async (req, res) => {
  const {
    title,
    description,
    image_url,
    total_questions,
    reward_amount,
    difficulty,
    deadline,
    created_by,
  } = req.body;

  // Validation
  if (
    !title ||
    !total_questions ||
    !reward_amount ||
    !difficulty ||
    !deadline ||
    !created_by
  ) {
    return res.status(400).json({
      message:
        "title, total_questions, reward_amount, difficulty, deadline, created_by are required",
    });
  }

  try {
    const query = `
      INSERT INTO quizzes (
        title,
        description,
        image_url,
        total_questions,
        reward_amount,
        difficulty,
        deadline,
        created_by
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
      RETURNING *;
    `;

    const values = [
      title,
      description || null,
      image_url || null,
      total_questions,
      reward_amount,
      difficulty,
      deadline,
      created_by,
    ];

    const result = await db.query(query, values);

    res.status(201).json({
      message: "Quiz created successfully",
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller for editing an existing quiz by ID
exports.editQuizById = async (req, res) => {
  const { id } = req.params;
  const {
    title,
    description,
    image_url,
    total_questions,
    reward_amount,
    difficulty,
    deadline,
    is_active,
  } = req.body;

  if (!id) {
    return res.status(400).json({ message: "Quiz ID is required" });
  }

  const fields = [];
  const values = [];

  const addField = (field, value) => {
    fields.push(`${field} = $${fields.length + 1}`);
    values.push(value);
  };

  if (title) addField("title", title);
  if (description !== undefined) addField("description", description);
  if (image_url !== undefined) addField("image_url", image_url);
  if (total_questions) addField("total_questions", total_questions);
  if (reward_amount) addField("reward_amount", reward_amount);
  if (difficulty) addField("difficulty", difficulty);
  if (deadline) addField("deadline", deadline);
  if (is_active !== undefined) addField("is_active", is_active);

  if (fields.length === 0) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  const query = `
    UPDATE quizzes
    SET ${fields.join(", ")}
    WHERE id = $${fields.length + 1}
    RETURNING *;
  `;

  values.push(id);

  try {
    const result = await db.query(query, values);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.json({
      message: "Quiz updated successfully",
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Update quiz error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// UPDATE QUIZ STATUS (Admin)
exports.updateQuizStatus = async (req, res) => {
  const quizId = req.params.id;
  const { status } = req.body;

  // Validate input
  if (!status) {
    return res.status(400).json({ message: "Status is required" });
  }

  const allowedStatuses = ["ACTIVE", "PROCESSING"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "Invalid status value",
    });
  }

  try {
    const result = await db.query(
      `UPDATE quizzes
       SET status = $1
       WHERE id = $2
       RETURNING id, title, status`,
      [status, quizId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    res.status(200).json({
      message: "Quiz status updated successfully",
      quiz: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating quiz status:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL QUIZZES
// GET ALL QUIZZES (With Filters & Pagination)
exports.getAllQuizzes = async (req, res) => {
  const { difficulty, status, page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const result = await db.query(
      `
      SELECT
        id,
        title,
        description,
        image_url,
        total_questions,
        reward_amount,
        difficulty,
        deadline,
        status,
        created_at
      FROM quizzes
      WHERE is_active = TRUE
        AND ($1::text IS NULL OR difficulty = $1)
        AND ($2::text IS NULL OR status = $2)
      ORDER BY created_at DESC
      LIMIT $3 OFFSET $4;
      `,
      [difficulty || null, status || null, limit, offset]
    );

    res.json({
      page: Number(page),
      limit: Number(limit),
      quizzes: result.rows,
    });
  } catch (error) {
    console.error("Fetch quizzes error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
