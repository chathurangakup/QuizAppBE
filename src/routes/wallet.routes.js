const express = require("express");
const router = express.Router();
const walletController = require("../controllers/wallet.controller");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

router.get("/", auth, walletController.getWallet);
router.get("/transactions", auth, walletController.getWalletTransactions);
router.post(
  "/update-balance",
  auth,
  admin,
  walletController.updateWalletBalance,
);
router.get("/:userId", auth, admin, walletController.getUserWalletByAdmin);

module.exports = router;
