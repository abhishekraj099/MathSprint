const admin = require("firebase-admin");
const path = require("path");
const fs = require("fs");

// Load Firebase credentials - try local file first, then environment variables
let serviceAccount;

const keyPath = path.join(__dirname, "../serviceAccountKey.json");

// Check if serviceAccountKey.json exists (local development)
if (fs.existsSync(keyPath)) {
  serviceAccount = require(keyPath);
} else {
  // Production: Build from environment variables
  serviceAccount = {
    type: "service_account",
    project_id: process.env.FIREBASE_PROJECT_ID,
    private_key_id: "key-id",
    private_key: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
    client_email: process.env.FIREBASE_CLIENT_EMAIL,
    client_id: "client-id",
    auth_uri: "https://accounts.google.com/o/oauth2/auth",
    token_uri: "https://accounts.google.com/o/oauth2/token",
  };
}

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
