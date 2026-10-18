const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const User = require("../models/User");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

const sendPasswordResetEmail = async ({ to, resetUrl }) => {
  if (!process.env.RESEND_API_KEY || !process.env.SMTP_FROM) return false;
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.SMTP_FROM,
      to: [to],
      subject: "Reset your TravelInn password",
      text: `We received a request to reset your TravelInn password. This link expires in 15 minutes: ${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:32px;color:#202124"><h1 style="color:#203b36">Reset your password</h1><p>We received a request to reset your TravelInn password.</p><p><a href="${resetUrl}" style="display:inline-block;background:#203b36;color:#fff;text-decoration:none;padding:13px 20px;border-radius:8px">Create a new password</a></p><p>This link expires in 15 minutes. If you did not request this, you can safely ignore this email.</p></div>`,
    }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("Password reset email provider error:", response.status, detail);
    throw new Error("Email provider could not send the reset message.");
  }
  return true;
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ success: false, message: "Please enter a valid email address." });
    }

    if (String(password).length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters",
      });
    }

    const existingUser = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: String(name).trim(),
      email: String(email).trim().toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "User already exists with this email." });
    console.error("Registration failed:", error);
    res.status(500).json({ success: false, message: "Registration failed. Please try again." });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const user = await User.findOne({
      email: String(email).trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({
      success: false,
      message: "Login failed. Please try again.",
    });
  }
};

const forgotPassword = async (req, res) => {
  const genericMessage = "If an account exists for that email, a password reset link will be sent.";
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    if (!email) return res.status(400).json({ success: false, message: "Email is required." });

    const user = await User.findOne({ email });
    // Do not reveal whether an email is registered.
    if (!user) return res.status(200).json({ success: true, message: genericMessage });

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.passwordResetTokenHash = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.passwordResetExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    const clientUrl = (process.env.CLIENT_URL || "http://localhost:5173").split(",")[0].trim().replace(/\/$/, "");
    const resetUrl = `${clientUrl}/reset-password/${rawToken}`;
    if (!process.env.RESEND_API_KEY || !process.env.SMTP_FROM) {
      // Local development can use the one-time link printed to the server console.
      if (process.env.NODE_ENV !== "production") {
        console.info(`[TravelInn development password reset] ${resetUrl}`);
        return res.status(200).json({ success: true, message: genericMessage, ...(process.env.NODE_ENV === "development" ? { developmentResetUrl: resetUrl } : {}) });
      }
      console.error("Password reset email is not configured. Set RESEND_API_KEY and SMTP_FROM.");
      return res.status(503).json({ success: false, message: "Password reset email is temporarily unavailable. Please contact support." });
    }

    await sendPasswordResetEmail({ to: user.email, resetUrl });

    return res.status(200).json({ success: true, message: genericMessage });
  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({ success: false, message: "Unable to process the request right now. Please try again." });
  }
};

const resetPassword = async (req, res) => {
  try {
    const token = String(req.params.token || "");
    const password = String(req.body?.password || "");
    if (!token || !password) return res.status(400).json({ success: false, message: "Reset token and new password are required." });
    if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters." });

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select("+passwordResetTokenHash +passwordResetExpiresAt");

    if (!user) return res.status(400).json({ success: false, message: "This reset link is invalid or expired. Request a new one." });

    user.password = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();

    return res.status(200).json({ success: true, message: "Password updated successfully. Please log in with your new password." });
  } catch (error) {
    console.error("Reset password error:", error);
    return res.status(500).json({ success: false, message: "Unable to reset password right now. Please try again." });
  }
};

const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to get user",
      error: error.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getCurrentUser,
};