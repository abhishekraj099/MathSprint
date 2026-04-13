const express = require("express");
const router = express.Router();
const admin = require("firebase-admin");
const jwt = require("jsonwebtoken");

function generateJwt(payload) {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET not configured");
  }
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "7d" });
}

router.post("/get-token", async (req, res) => {
  try {
    const { userId } = req.body;

    // Validate input
    if (!userId || typeof userId !== "string" || userId.trim().length === 0) {
      return res.status(400).json({ error: "Valid userId is required" });
    }

    if (userId.length > 100) {
      return res.status(400).json({ error: "userId is too long" });
    }

    const db = admin.database();
    const snapshot = await db.ref(`users/${userId}`).once("value");

    if (!snapshot.exists()) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = snapshot.val();
    
    // Validate user data
    if (!userData.username) {
      return res.status(400).json({ error: "User data invalid" });
    }

    const token = generateJwt({
      uid: userId,
      username: userData.username,
      skillLevel: ["beginner", "intermediate", "advanced"].includes(userData.skillLevel) 
        ? userData.skillLevel 
        : "beginner",
      role: userData.role || "user", // Add role field: defaults to "user", can be "admin"
    });

    return res.json({ success: true, token });

  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(500).json({ error: "Failed to generate token" });
  }
});

module.exports = router;