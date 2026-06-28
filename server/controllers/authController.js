import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { sql } from "../db/index.js";
import { sendEmail, emailTemplates } from "../utils/email.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_123";
const JWT_EXPIRES_IN = "7d";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

const generateToken = (id) => {
  return jwt.sign({ id }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res) => {
  try {
    const { email, password, full_name, company } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Please provide email, password, and full name" });
    }

    // Check if user exists
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    // Create verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Insert user
    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, company, verification_token)
      VALUES (${email}, ${password_hash}, ${full_name}, ${company || null}, ${verificationToken})
      RETURNING id, email, full_name, role
    `;

    // Send verification email
    const verifyUrl = `${FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const template = emailTemplates.welcome(full_name, verifyUrl);
    
    // We don't await this so the response is fast, but handle errors internally
    sendEmail({ to: email, ...template }).catch(console.error);

    // Create JWT
    const token = generateToken(user.id);

    res.status(201).json({
      message: "Registration successful. Please check your email to verify your account.",
      token,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during registration" });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Please provide email and password" });
    }

    // Check for user
    const [user] = await sql`SELECT * FROM users WHERE email = ${email}`;
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check lock status
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      return res.status(403).json({ error: "Account is temporarily locked. Try again later." });
    }
    
    // Check if active
    if (user.status !== "Active") {
      return res.status(403).json({ error: "Account deactivated or suspended." });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Increment failed attempts
      const attempts = user.failed_login_attempts + 1;
      if (attempts >= 5) {
        // Lock for 15 mins
        const lockUntil = new Date(Date.now() + 15 * 60 * 1000);
        await sql`UPDATE users SET failed_login_attempts = ${attempts}, locked_until = ${lockUntil} WHERE id = ${user.id}`;
        return res.status(403).json({ error: "Too many failed attempts. Account locked for 15 minutes." });
      }
      await sql`UPDATE users SET failed_login_attempts = ${attempts} WHERE id = ${user.id}`;
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Successful login - reset attempts and update last login
    await sql`
      UPDATE users 
      SET failed_login_attempts = 0, locked_until = NULL, last_login = NOW() 
      WHERE id = ${user.id}
    `;

    // Strip password hash from response
    delete user.password_hash;

    res.json({
      token: generateToken(user.id),
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error during login" });
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
  try {
    const [user] = await sql`
      SELECT id, email, full_name, role, status, phone, company, department, 
             job_title, bio, location, website, linkedin, github, 
             time_zone, language, theme_preference, profile_picture_url, cover_image_url,
             is_verified, created_at, last_login
      FROM users WHERE id = ${req.user.id}
    `;
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Verify Email
// @route   POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) return res.status(400).json({ error: "Token is required" });

    const [user] = await sql`SELECT id FROM users WHERE verification_token = ${token}`;
    if (!user) return res.status(400).json({ error: "Invalid or expired token" });

    await sql`
      UPDATE users 
      SET is_verified = TRUE, verification_token = NULL 
      WHERE id = ${user.id}
    `;

    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ error: "Server error during verification" });
  }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const [user] = await sql`SELECT id, full_name FROM users WHERE email = ${email}`;
    
    // Don't reveal if user exists or not for security
    if (!user) {
      return res.json({ message: "If an account exists, a reset link has been sent." });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await sql`
      UPDATE users 
      SET reset_token = ${resetToken}, reset_token_expiry = ${expiry} 
      WHERE id = ${user.id}
    `;

    const resetUrl = `${FRONTEND_URL}/reset-password?token=${resetToken}`;
    const template = emailTemplates.passwordReset(resetUrl);
    
    sendEmail({ to: email, ...template }).catch(console.error);

    res.json({ message: "If an account exists, a reset link has been sent." });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: "Token and new password required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const [user] = await sql`
      SELECT id FROM users 
      WHERE reset_token = ${token} AND reset_token_expiry > NOW()
    `;

    if (!user) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    await sql`
      UPDATE users 
      SET password_hash = ${password_hash}, reset_token = NULL, reset_token_expiry = NULL 
      WHERE id = ${user.id}
    `;

    res.json({ message: "Password reset successfully. You can now login." });
  } catch (error) {
    res.status(500).json({ error: "Server error during password reset" });
  }
};
