const express = require("express");
const router = express.Router();
const withdrawalController = require("../controllers/withdrawal.controller");
const auth = require("../utils/auth.middleware");
const admin = require("../utils/admin.middleware");

// USER
router.post("/", auth, withdrawalController.createWithdrawalRequest);
router.get("/", auth, withdrawalController.getUserWithdrawals);

// ADMIN
router.get(
  "/admin/pending",
  auth,
  admin,
  withdrawalController.getPendingWithdrawals
);
router.post(
  "/admin/:id/approve",
  auth,
  admin,
  withdrawalController.approveWithdrawal
);
router.post(
  "/admin/:id/reject",
  auth,
  admin,
  withdrawalController.rejectWithdrawal
);
router.post("/admin/:id/paid", auth, admin, withdrawalController.markAsPaid);

module.exports = router;
