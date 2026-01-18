const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");
const auth = require("../utils/auth.middleware");
const admin = require("../utils/admin.middleware");

router.get("/", auth, walletController.getWallet);
router.get("/transactions", auth, walletController.getWalletTransactions);
router.post(
  "/update-balance",
  auth,
  admin,
  walletController.updateWalletBalance
);

module.exports = router;
