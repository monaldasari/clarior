import jwt from "jsonwebtoken";
import { sql } from "../db/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "fallback_super_secret_key_123";

// Protect routes
export const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ error: "Not authorized, no token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Check if user still exists
    const [user] = await sql`SELECT id, email, role, status FROM users WHERE id = ${decoded.id}`;

    if (!user) {
      return res.status(401).json({ error: "Not authorized, user no longer exists" });
    }

    if (user.status !== "Active") {
      return res.status(403).json({ error: "Your account has been deactivated or suspended" });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    console.error("JWT verification failed:", err);
    return res.status(401).json({ error: "Not authorized, token failed" });
  }
};

// Role-based authorization
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: `User role '${req.user?.role}' is not authorized to access this route` 
      });
    }
    next();
  };
};
