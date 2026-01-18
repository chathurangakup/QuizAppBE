const express = require("express");
require("dotenv").config();

const authRoutes = require("./routes/auth.routes");
const userDevicesRoutes = require("./routes/userDevices.routes");
const kycRoutes = require("./routes/kyc.routes");
const adminRoutes = require("./routes/admin.routes");
const quizRoutes = require("./routes/quiz.routes");
const qoptionsRoutes = require("./routes/qoptions.routes");
const submitquizRoutes = require("./routes/submitquiz.routes");
const walletRoutes = require("./routes/wallet.routes");
const withdrawalRoutes = require("./routes/withdrawal.routes");

const app = express();

app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/user", userDevicesRoutes);
app.use("/api/kyc", kycRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/qoptions", qoptionsRoutes);
app.use("/api/submitquiz", submitquizRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/withdrawal", withdrawalRoutes);

module.exports = app;
