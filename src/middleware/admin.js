module.exports = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(403).json({ message: "Admin access only" });
  }

  // Allow multiple admin roles
  const allowedRoles = ["ADMIN", "SUPER_ADMIN"];

  if (!allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Admin access only" });
  }

  next();
};
