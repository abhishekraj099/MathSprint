const admin = require("firebase-admin");
const path = require("path");

// Load Firebase credentials
const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

// Initialize Firebase Admin SDK
try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
  console.log("Firebase initialized successfully");
} catch (err) {
  console.error("Firebase initialization error:", err.message);
  // Continue even if Firebase initialization fails (for fallback mode)
}

// Export the Realtime Database instance
module.exports = {
  db: admin.database(),
  admin: admin,
};
