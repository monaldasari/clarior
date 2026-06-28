import { sql } from "../db/index.js";
import bcrypt from "bcryptjs";

// @desc    Update current user profile
// @route   PUT /api/users/me
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const { full_name, phone, company, department, job_title, bio, location, website, linkedin, github, time_zone, language, theme_preference } = req.body;
    
    if (!full_name) {
      return res.status(400).json({ error: "Full name is required" });
    }

    const [updated] = await sql`
      UPDATE users SET
        full_name = ${full_name},
        phone = ${phone || null},
        company = ${company || null},
        department = ${department || null},
        job_title = ${job_title || null},
        bio = ${bio || null},
        location = ${location || null},
        website = ${website || null},
        linkedin = ${linkedin || null},
        github = ${github || null},
        time_zone = ${time_zone || "UTC"},
        language = ${language || "en"},
        theme_preference = ${theme_preference || "system"},
        updated_at = NOW()
      WHERE id = ${req.user.id}
      RETURNING id, email, full_name, role, status, phone, company, department, job_title, bio, location, website, linkedin, github, time_zone, language, theme_preference, profile_picture_url, cover_image_url
    `;

    res.json(updated);
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getUsers = async (req, res) => {
  try {
    const users = await sql`
      SELECT id, email, full_name, role, status, department, job_title, created_at, last_login
      FROM users
      ORDER BY id ASC
    `;
    res.json(users);
  } catch (error) {
    console.error("Error getting users:", error);
    res.status(500).json({ error: "Failed to get users" });
  }
};

// @desc    Create a user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
export const createUser = async (req, res) => {
  try {
    const { email, password, full_name, role, department, job_title } = req.body;

    if (!email || !password || !full_name) {
      return res.status(400).json({ error: "Please provide email, password, and full name" });
    }

    // Check if user exists
    const [existing] = await sql`SELECT id FROM users WHERE email = ${email}`;
    if (existing) {
      return res.status(400).json({ error: "User already exists with this email" });
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(password, salt);

    const [user] = await sql`
      INSERT INTO users (email, password_hash, full_name, role, department, job_title, is_verified)
      VALUES (${email}, ${password_hash}, ${full_name}, ${role || "Employee"}, ${department || null}, ${job_title || null}, TRUE)
      RETURNING id, email, full_name, role, status, department, job_title, created_at
    `;

    res.status(201).json(user);
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({ error: "Failed to create user" });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
export const updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { full_name, role, status, department, job_title } = req.body;

    const [updated] = await sql`
      UPDATE users SET
        full_name = ${full_name},
        role = ${role},
        status = ${status},
        department = ${department || null},
        job_title = ${job_title || null},
        updated_at = NOW()
      WHERE id = ${id}
      RETURNING id, email, full_name, role, status, department, job_title
    `;

    if (!updated) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(updated);
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({ error: "Failed to update user" });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent deleting oneself
    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: "You cannot delete your own admin account" });
    }

    const [deleted] = await sql`
      DELETE FROM users WHERE id = ${id} RETURNING id, full_name
    `;

    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "User deleted successfully", deleted });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
};

// @desc    Upload avatar
// @route   POST /api/users/avatar
// @access  Private
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const host = req.get("host");
    const protocol = req.protocol;
    const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

    const [updated] = await sql`
      UPDATE users SET
        profile_picture_url = ${avatarUrl},
        updated_at = NOW()
      WHERE id = ${req.user.id}
      RETURNING id, profile_picture_url
    `;

    res.json(updated);
  } catch (error) {
    console.error("Error uploading avatar:", error);
    res.status(500).json({ error: "Failed to upload avatar" });
  }
};

// @desc    Change password
// @route   PUT /api/users/change-password
// @access  Private
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Please enter current and new passwords" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }

    // Get user password hash
    const [user] = await sql`SELECT password_hash FROM users WHERE id = ${req.user.id}`;

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(newPassword, salt);

    // Update password
    await sql`
      UPDATE users 
      SET password_hash = ${password_hash}, updated_at = NOW() 
      WHERE id = ${req.user.id}
    `;

    res.json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
};


