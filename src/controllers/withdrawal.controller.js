const db = require("../config/db");

exports.createWithdrawalRequest = async (req, res) => {
  const userId = req.user.userId;
  const { amount, payment_method, payment_details } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({ message: "Invalid amount" });
  }

  try {
    const walletResult = await db.query(
      `SELECT balance FROM wallets WHERE user_id = $1`,
      [userId]
    );

    if (walletResult.rows.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    if (walletResult.rows[0].balance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    await db.query(
      `INSERT INTO withdrawal_requests
       (user_id, amount, payment_method, payment_details)
       VALUES ($1,$2,$3,$4)`,
      [userId, amount, payment_method, payment_details]
    );

    res.status(201).json({ message: "Withdrawal request submitted" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getUserWithdrawals = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT id, amount, status, created_at, reviewed_at
       FROM withdrawal_requests
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId]
    );

    res.json({ withdrawals: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getPendingWithdrawals = async (req, res) => {
  const result = await db.query(
    `SELECT
        wr.id,
        u.email,
        wr.amount,
        wr.payment_method,
        wr.status,
        wr.created_at
     FROM withdrawal_requests wr
     JOIN users u ON u.id = wr.user_id
     WHERE wr.status = 'PENDING'
     ORDER BY wr.created_at ASC`
  );

  res.json({ withdrawals: result.rows });
};

// exports.approveWithdrawal = async (req, res) => {
//   const { id } = req.params;
//   const adminId = req.user.userId;

//   try {
//     await db.query("BEGIN");

//     const wrRes = await db.query(
//       `SELECT * FROM withdrawal_requests WHERE id = $1 FOR UPDATE`,
//       [id]
//     );

//     if (wrRes.rows.length === 0) {
//       await db.query("ROLLBACK");
//       return res.status(404).json({ message: "Request not found" });
//     }

//     const wr = wrRes.rows[0];

//     if (wr.status !== "PENDING") {
//       await db.query("ROLLBACK");
//       return res.status(400).json({ message: "Invalid withdrawal state" });
//     }

//     const walletRes = await db.query(
//       `SELECT id, balance FROM wallets WHERE user_id = $1 FOR UPDATE`,
//       [wr.user_id]
//     );

//     if (walletRes.rows[0].balance < wr.amount) {
//       await db.query("ROLLBACK");
//       return res.status(400).json({ message: "Insufficient balance" });
//     }

//     // Ledger entry
//     await db.query(
//       `INSERT INTO wallet_transactions
//        (wallet_id, type, amount, reference_id)
//        VALUES ($1,'WITHDRAWAL',$2,$3)`,
//       [walletRes.rows[0].id, wr.amount, wr.id]
//     );

//     await db.query(
//       `UPDATE withdrawal_requests
//        SET status = 'APPROVED', reviewed_by = $1, reviewed_at = NOW()
//        WHERE id = $2`,
//       [adminId, id]
//     );

//     await db.query("COMMIT");

//     res.json({ message: "Withdrawal approved" });
//   } catch (error) {
//     await db.query("ROLLBACK");
//     console.error(error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

exports.approveWithdrawal = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.userId;

  try {
    await db.query("BEGIN");

    const wrRes = await db.query(
      `SELECT * FROM withdrawal_requests WHERE id = $1 FOR UPDATE`,
      [id]
    );

    if (wrRes.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "Request not found" });
    }

    const wr = wrRes.rows[0];

    if (wr.status !== "PENDING") {
      await db.query("ROLLBACK");
      return res.status(400).json({ message: "Invalid withdrawal state" });
    }

    await db.query(
      `UPDATE withdrawal_requests
       SET status = 'APPROVED',
           reviewed_by = $1,
           reviewed_at = NOW()
       WHERE id = $2`,
      [adminId, id]
    );

    await db.query("COMMIT");

    res.json({ message: "Withdrawal approved" });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.rejectWithdrawal = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.userId;

  await db.query(
    `UPDATE withdrawal_requests
     SET status = 'REJECTED', reviewed_by = $1, reviewed_at = NOW()
     WHERE id = $2`,
    [adminId, id]
  );

  res.json({ message: "Withdrawal rejected" });
};

exports.markAsPaid = async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.userId;

  await db.query(
    `UPDATE withdrawal_requests
     SET status = 'PAID', reviewed_by = $1, reviewed_at = NOW()
     WHERE id = $2`,
    [adminId, id]
  );

  res.json({ message: "Marked as paid" });
};
