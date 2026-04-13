/**
 * Admin Role Verification Middleware
 * Ensures user has "admin" role in JWT token
 * Requires verifyToken middleware to run first (so req.user is set)
 */

const requireAdmin = (req, res, next) => {
  // Check if req.user exists (set by verifyToken middleware)
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
    });
  }

  // Check if user has admin role
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      error: "Admin access required",
    });
  }

  // User is admin, proceed to next middleware/controller
  next();
};

module.exports = requireAdmin;
