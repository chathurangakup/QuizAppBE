const pool = require("../config/db");

exports.updateKycRequest = async (req, res) => {
  const userId = req.user.userId; // ✅ Get userId from token

  const {
    document_type,
    document_number,
    document_image_front_url,
    document_image_back_url,
    selfie_image_url,
    address,
  } = req.body;

  // 🔒 Validation
  if (
    !document_type ||
    !document_image_front_url ||
    !document_image_back_url ||
    !selfie_image_url ||
    !address
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `INSERT INTO kyc_requests (
        user_id,
        document_type,
        document_number,
        document_image_front_url,
        document_image_back_url,
        selfie_image_url,
        address
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING *`,
      [
        userId, // 🔥 coming from JWT
        document_type,
        document_number,
        document_image_front_url,
        document_image_back_url,
        selfie_image_url,
        address,
      ],
    );

    res.status(201).json({
      message: "KYC request created successfully",
      kycRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Error creating KYC request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// PUT API to update selfie_image_url
exports.updateSelfieImageUrl = async (req, res) => {
  const { id } = req.params;
  const { selfie_image_url } = req.body;

  if (!selfie_image_url) {
    return res.status(400).json({ message: "Missing selfie_image_url" });
  }

  try {
    const result = await pool.query(
      `UPDATE kyc_requests SET selfie_image_url = $1 WHERE id = $2 RETURNING *`,
      [selfie_image_url, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "KYC request not found" });
    }

    res.status(200).json({
      message: "Selfie image URL updated successfully",
      kycRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating selfie image URL:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// API to update status, reviewed_by, and review_note
exports.updateKycReview = async (req, res) => {
  const { id } = req.params;
  const { status, reviewed_by, review_note } = req.body;

  if (!status || !reviewed_by) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  try {
    const result = await pool.query(
      `UPDATE kyc_requests SET status = $1, reviewed_by = $2, review_note = $3, reviewed_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *`,
      [status, reviewed_by, review_note, id],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "KYC request not found" });
    }

    res.status(200).json({
      message: "KYC request updated successfully",
      kycRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Error updating KYC review:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// // GET all KYC requests (Admin)
exports.getAllKycRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         kr.*,
         u.email AS user_email
       FROM kyc_requests kr
       JOIN users u ON u.id = kr.user_id
       ORDER BY kr.created_at DESC`,
    );

    res.json({ kycRequests: result.rows });
  } catch (error) {
    console.error("Error fetching KYC requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// // GET KYC requests by status (PENDING / APPROVED / REJECTED)
// exports.getKycRequestsByStatus = async (req, res) => {
//   const { status } = req.query;

//   if (!status) {
//     return res.status(400).json({ message: "Status is required" });
//   }

//   try {
//     const result = await pool.query(
//       `SELECT
//          kr.*,
//          u.email AS user_email
//        FROM kyc_requests kr
//        JOIN users u ON u.id = kr.user_id
//        WHERE kr.status = $1
//        ORDER BY kr.created_at ASC`,
//       [status]
//     );

//     res.json({ kycRequests: result.rows });
//   } catch (error) {
//     console.error("Error fetching KYC requests by status:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// // GET single KYC request by ID
// exports.getKycRequestById = async (req, res) => {
//   const { id } = req.params;

//   try {
//     const result = await pool.query(
//       `SELECT
//          kr.*,
//          u.email AS user_email
//        FROM kyc_requests kr
//        JOIN users u ON u.id = kr.user_id
//        WHERE kr.id = $1`,
//       [id]
//     );

//     if (result.rows.length === 0) {
//       return res.status(404).json({ message: "KYC request not found" });
//     }

//     res.json({ kycRequest: result.rows[0] });
//   } catch (error) {
//     console.error("Error fetching KYC request:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.getMyKycRequest = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await pool.query(
      `SELECT *
       FROM kyc_requests
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 1`,
      [userId],
    );

    // ✅ No KYC yet → NOT an error
    if (result.rows.length === 0) {
      return res.status(200).json({
        hasKyc: false,
        kycRequest: null,
        message: "KYC not submitted yet",
      });
    }

    // ✅ KYC exists
    res.status(200).json({
      hasKyc: true,
      kycRequest: result.rows[0],
    });
  } catch (error) {
    console.error("Error fetching user KYC:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
