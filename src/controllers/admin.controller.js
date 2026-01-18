// POST API to add admin user data

const { signToken } = require("../utils/jwt");
const { hashPassword, comparePassword } = require("../utils/password");
const pool = require("../config/db");

exports.addAdminUser = async (req, res) => {
  const { email, password, role } = req.body;

  if (!email || !password || !role) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const passwordHash = await hashPassword(password);

    const result = await pool.query(
      `INSERT INTO admin_users (email, password_hash, role)
             VALUES ($1, $2, $3)
             RETURNING id, email, role, created_at`,
      [email, passwordHash, role]
    );

    res.status(201).json({
      message: "Admin user created successfully",
      adminUser: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating admin user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ADMIN LOGIN
exports.adminLogin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Missing credentials" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, password_hash, role
       FROM admin_users
       WHERE email = $1`,
      [email]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const admin = result.rows[0];
    const isValid = await comparePassword(password, admin.password_hash);

    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Include role for RBAC
    const token = signToken({
      adminId: admin.id,
      role: admin.role,
      type: "ADMIN",
    });

    res.status(200).json({
      message: "Admin login successful",
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        role: admin.role,
      },
    });
  } catch (err) {
    console.error("Admin login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
