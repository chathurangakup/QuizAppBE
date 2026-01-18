const db = require("../config/db");

/**
 * GET user wallet balance
 */
exports.getWallet = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT
         id,
         total_earnings,
         today_earnings,
         available_to_withdraw,
         created_at,
         updated_at
       FROM wallets
       WHERE user_id = $1`,
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Wallet not found" });
    }

    res.json({ wallet: result.rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * GET wallet transaction history (READ ONLY)
 */
exports.getWalletTransactions = async (req, res) => {
  const userId = req.user.userId;

  try {
    const result = await db.query(
      `SELECT
         wt.id,
         wt.type,
         wt.amount,
         wt.reference_id,
         wt.created_at
       FROM wallet_transactions wt
       JOIN wallets w ON w.id = wt.wallet_id
       WHERE w.user_id = $1
       ORDER BY wt.created_at DESC`,
      [userId]
    );

    res.json({ transactions: result.rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

/**
 * Create wallet if not exists and/or update balance
 * type = 'CREDIT' | 'DEBIT' (CREDIT adds, DEBIT subtracts)
 * reason = 'QUIZ_REWARD' | 'ADJUSTMENT'
 */

exports.updateWalletBalance = async (req, res) => {
  const adminId = req.user.userId;

  const {
    user_id,
    total_earnings,
    today_earnings,
    available_to_withdraw,
    transaction_type,
  } = req.body;

  // 🔐 Basic validation
  if (
    !user_id ||
    total_earnings === undefined ||
    today_earnings === undefined ||
    available_to_withdraw === undefined ||
    !transaction_type
  ) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!["QUIZ_REWARD", "ADJUSTMENT"].includes(transaction_type)) {
    return res.status(400).json({ message: "Invalid transaction type" });
  }

  if (total_earnings < 0 || today_earnings < 0 || available_to_withdraw < 0) {
    return res
      .status(400)
      .json({ message: "Wallet values cannot be negative" });
  }

  try {
    await db.query("BEGIN");

    // 🔒 Admin validation
    const adminCheck = await db.query(
      `SELECT id FROM admin_users WHERE id = $1`,
      [adminId]
    );

    if (adminCheck.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(403).json({ message: "Invalid admin" });
    }

    // 🔒 Lock wallet
    let walletRes = await db.query(
      `SELECT id FROM wallets WHERE user_id = $1 FOR UPDATE`,
      [user_id]
    );

    let walletId;

    // 1️⃣ Create wallet if missing
    if (walletRes.rows.length === 0) {
      const created = await db.query(
        `INSERT INTO wallets
         (user_id, total_earnings, today_earnings, available_to_withdraw)
         VALUES ($1, $2, $3, $4)
         RETURNING id`,
        [user_id, total_earnings, today_earnings, available_to_withdraw]
      );
      walletId = created.rows[0].id;
    } else {
      walletId = walletRes.rows[0].id;

      // 2️⃣ Update wallet explicitly
      await db.query(
        `UPDATE wallets
         SET
           total_earnings = $1,
           today_earnings = $2,
           available_to_withdraw = $3,
           updated_at = NOW()
         WHERE id = $4`,
        [total_earnings, today_earnings, available_to_withdraw, walletId]
      );
    }

    // 3️⃣ Ledger entry (SOURCE OF TRUTH)
    await db.query(
      `INSERT INTO wallet_transactions
       (wallet_id, type, amount, reference_id)
       VALUES ($1, $2, $3, $4)`,
      [walletId, transaction_type, available_to_withdraw, adminId]
    );

    await db.query("COMMIT");

    res.json({
      message: "Wallet updated successfully",
      wallet: {
        user_id,
        total_earnings,
        today_earnings,
        available_to_withdraw,
      },
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};
