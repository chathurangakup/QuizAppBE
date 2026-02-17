const pool = require("../config/db");
const { hashPassword, comparePassword } = require("../middleware/password");
const { signToken } = require("../middleware/jwt");

// REGISTER
exports.register = async (req, res) => {
  const { email, phone, password, name, country } = req.body;

  // Required validation
  if (!email || !password || !name || !country) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO users (
        email,
        phone,
        password_hash,
        name,
        country
      )
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, phone, name, country, kyc_status, created_at`,
      [email, phone || null, passwordHash, name, country],
    );

    res.status(201).json({
      message: "User registered successfully",
      user: result.rows[0],
    });
  } catch (err) {
    // Unique constraint violation (email or phone)
    if (err.code === "23505") {
      return res.status(409).json({
        message: "Email or phone already exists",
      });
    }

    console.error("Register error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const result = await pool.query(
      `SELECT id, password_hash, is_active FROM users WHERE email = $1`,
      [email],
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];
    const isValid = await comparePassword(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(403).json({ message: "User account is inactive" });
    }

    // // Check if user is an admin
    const adminCheck = await pool.query(
      `SELECT role FROM admin_users WHERE email = $1`,
      [email],
    );

    const role = adminCheck.rowCount > 0 ? adminCheck.rows[0].role : "USER";

    const token = signToken({ userId: user.id, role });
    console.log("Generated JWT Token:", token);

    res.json({
      message: "Login successful",
      token,
      userId: user.id,
      role,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller function to get phone, email, and name
exports.getUserDetails = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT 
        id,
        email,
        phone,
        name,
        country,
        kyc_status,
        is_active,
        created_at,
        updated_at
      FROM users
      WHERE id = $1`,
      [userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Controller function to update user details
exports.updateUserDetails = async (req, res) => {
  const userId = req.params.id;
  const { name, email, phone, country } = req.body;

  // At least one field required
  if (!name && !email && !phone && !country) {
    return res.status(400).json({ message: "No fields provided to update" });
  }

  try {
    const result = await pool.query(
      `UPDATE users SET
        name = COALESCE($1, name),
        email = COALESCE($2, email),
        phone = COALESCE($3, phone),
        country = COALESCE($4, country),
        updated_at = NOW()
      WHERE id = $5
      RETURNING id, name, email, phone, country, kyc_status, updated_at`,
      [name, email, phone, country, userId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "User updated successfully",
      user: result.rows[0],
    });
  } catch (error) {
    // Unique constraint violation
    if (error.code === "23505") {
      return res.status(409).json({
        message: "Email or phone already exists",
      });
    }

    console.error("Error updating user details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// GET ALL USERS (Admin only ideally)
exports.getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
        id,
        email,
        phone,
        name,
        country,
        kyc_status,
        is_active,
        created_at,
        updated_at
      FROM users
      ORDER BY created_at DESC`,
    );

    res.status(200).json({
      count: result.rowCount,
      users: result.rows,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
