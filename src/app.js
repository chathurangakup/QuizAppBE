const express = require("express");
const cors = require("cors"); // <- add this
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

// ✅ Enable CORS
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.8.176:3000"], // frontend origins
    credentials: true, // if you plan to send cookies
  }),
);

app.use(express.json());

// Routes
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
