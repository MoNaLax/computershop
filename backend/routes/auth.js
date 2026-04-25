const express = require("express");
const router = express.Router();

// Hardcoded admin credentials
const ADMIN_USERNAME = "Admin";
const ADMIN_PASSWORD = "123456";

// Simple session storage (in production, use database/redis)
const sessions = new Map();

// POST /api/auth/login - Login endpoint
router.post("/login", (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ error: "Username and password are required" });
    }

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate session token
    const sessionToken = Math.random().toString(36).substr(2, 32);
    const sessionData = {
      username: username,
      createdAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
    };

    sessions.set(sessionToken, sessionData);

    res.json({
      success: true,
      token: sessionToken,
      username: username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/verify - Verify session
router.post("/verify", (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res
        .status(401)
        .json({ error: "No token provided", authenticated: false });
    }

    const sessionData = sessions.get(token);

    if (!sessionData) {
      return res
        .status(401)
        .json({ error: "Invalid token", authenticated: false });
    }

    // Check if session expired
    if (sessionData.expiresAt < Date.now()) {
      sessions.delete(token);
      return res
        .status(401)
        .json({ error: "Session expired", authenticated: false });
    }

    res.json({
      authenticated: true,
      username: sessionData.username,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/logout - Logout endpoint
router.post("/logout", (req, res) => {
  try {
    const { token } = req.body;

    if (token) {
      sessions.delete(token);
    }

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
