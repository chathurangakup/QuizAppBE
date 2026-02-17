const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  console.log("Cookies:", req.cookies);
  console.log("Headers:", req.headers);
  console.log(req.headers.authorization);

  console.log("Token:", req.cookies.token);
  const token = req.cookies.token || req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("Decoded JWT Payload:", decoded); // Debugging log
    req.user = {
      userId: decoded.adminId || decoded.userId,
      role: decoded.role,
    };

    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
