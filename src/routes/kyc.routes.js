const express = require("express");
const router = express.Router();
const kycController = require("../controllers/kyc.controller");
const auth = require("../utils/auth.middleware");
const admin = require("../utils/admin.middleware");

// POST route to update kyc_requests table
router.post("/kyc-requests", auth, kycController.updateKycRequest);

// PUT route to update selfie_image_url
router.put(
  "/kyc-requests/:id/selfie-image",
  auth,
  kycController.updateSelfieImageUrl
);

// PUT route to update status, reviewed_by, and review_note
router.put(
  "/admin/kyc-requests/:id/review",
  auth,
  admin,
  kycController.updateKycReview
);

// GET (Admin)
// router.get("/admin/kyc-requests", auth, admin, kycController.getAllKycRequests);
// router.get(
//   "/admin/kyc-requests/status",
//   auth,
//   admin,
//   kycController.getKycRequestsByStatus
// );
// router.get(
//   "/admin/kyc-requests/:id",
//   auth,
//   admin,
//   kycController.getKycRequestById
// );

// GET (User)
router.get("/my-kyc", auth, kycController.getMyKycRequest);

module.exports = router;
