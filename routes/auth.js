///////////////////////////////////
require("dotenv").config();
const express = require("express");
const { body, validationResult } = require("express-validator");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const router = express.Router();
const fetchuser = require("../middleware/fetchuser");
const nodemailer = require("nodemailer");
const { OAuth2Client } = require("google-auth-library");
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const JWT_SECRET = process.env.JWT_SECRET;

// Google Login Route
router.post("/googlelogin", async (req, res) => {
  const { token } = req.body;

  try {
    if (!token) {
      return res.status(400).json({ error: "Token is required" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name: name,
        email: email,
        password: "", // No password for Google users
      });
    }

    const data = { user: { id: user.id } };
    const authToken = jwt.sign(data, JWT_SECRET);

    res.json({ token: authToken });
  } catch (error) {
    console.error("Google login error:", error.message);
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// POST /api/auth/createuser to create a new user (No Login required)
router.post(
  "/createuser",
  [
    body("name", "Name must be at least 3 characters long").isLength({
      min: 3,
    }),
    body("email", "Invalid email format").isEmail(),
    body("password", "Password must be at least 5 characters long").isLength({
      min: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let user = await User.findOne({ email: req.body.email });
      if (user) {
        return res
          .status(400)
          .json({ error: "Sorry, a user with this email already exists" });
      }

      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(req.body.password, salt);

      user = await User.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
      });

      const data = { user: { id: user.id } };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ token: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

// Authenticate a user using POST "/api/auth/login". No login required
router.post(
  "/signin",
  [
    body("email", "Invalid email format").isEmail(),
    body("password", "Password cannot be blank").exists(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {
      let user = await User.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ error: "Please enter valid credentials" });
      }

      const passwordCompare = await bcrypt.compare(password, user.password);
      if (!passwordCompare) {
        return res
          .status(400)
          .json({ error: "Please enter valid credentials" });
      }

      const data = { user: { id: user.id } };
      const authToken = jwt.sign(data, JWT_SECRET);

      res.json({ token: authToken });
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }
  }
);

/////////get user
router.post("/getuser", fetchuser, async (req, res) => {
  try {
    const userId = req.user.id; // Extract user ID from the decoded JWT
    console.log("User ID:", userId);

    if (!userId) {
      return res
        .status(400)
        .json({ error: "Invalid or missing user ID in token" });
    }

    const user = await User.findById(userId).select("-password"); // Fetch user from the database
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user); // Send user data back in JSON format
  } catch (error) {
    console.error("Error in getuser route:", error); // Log the error details
    res
      .status(500)
      .json({ error: "Internal Server Error", message: error.message });
  }
});

// Forgot Password Route
router.post("/passwordforgot", async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ error: "User with this email does not exist" });
    }

    const resetToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Point to your React frontend instead of backend
    const resetLink = `https://invoice-generator-mern-project.vercel.app/passwordreset/${resetToken}`;

    try {
      await sendResetEmail(user.email, resetLink);
      res.json({ message: "Password reset link sent to your email" });
    } catch (err) {
      console.error("Error sending email:", err);
      res
        .status(500)
        .json({ error: "Error sending email, please try again later" });
    }
  } catch (error) {
    console.error("Error during forgot password process:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Reset Password Route
router
  .route("/passwordreset/:token")
  .get(async (req, res) => {
    const { token } = req.params;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      if (!userId) return res.status(400).json({ error: "Invalid token" });

      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ error: "User does not exist" });

      res
        .status(200)
        .json({ message: "Token is valid. Proceed to reset your password." });
    } catch (error) {
      console.error(error.message);
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      res.status(500).send("Internal Server Error");
    }
  })
  .post(async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password || password.length < 5) {
      return res
        .status(400)
        .json({ error: "Password must be at least 5 characters long" });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      if (!userId) return res.status(400).json({ error: "Invalid token" });

      const user = await User.findById(userId);
      if (!user) return res.status(400).json({ error: "User does not exist" });

      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      user.password = hashedPassword;
      await user.save();

      res.json({ message: "Password reset successfully" });
    } catch (error) {
      console.error(error.message);
      if (
        error.name === "TokenExpiredError" ||
        error.name === "JsonWebTokenError"
      ) {
        return res.status(400).json({ error: "Invalid or expired token" });
      }
      res.status(500).send("Internal Server Error");
    }
  });

// Helper function to send reset email using Nodemailer
async function sendResetEmail(email, resetLink) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER, // Replace this with your real email
      pass: process.env.EMAIL_PASS, // Or app-specific password
    },
  });

  const mailOptions = {
    from: "hh0449901@gmail.com",
    to: email,
    subject: "Password Reset",
    html: `<p>Please click the <a href="${resetLink}">link</a> to reset your password. This link will expire in 1 hour.</p>`,
  };

  await transporter.sendMail(mailOptions);
}

module.exports = router;
