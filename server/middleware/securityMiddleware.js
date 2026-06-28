import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export const securityMiddleware = (app) => {
  // Set security HTTP headers
  app.use(helmet());

  // Enable CORS
  app.use(
    cors({
      origin: "*", // Adjust for production, e.g., ["http://localhost:5173", "https://yourdomain.com"]
      credentials: true,
    })
  );

  // Rate limiting to prevent brute-force attacks
  // Apply to all requests
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per `window`
    message: "Too many requests from this IP, please try again after 15 minutes",
    standardHeaders: true, 
    legacyHeaders: false,
  });
  app.use(limiter);

  // Stricter rate limit for authentication endpoints (login, register, forgot password)
  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit each IP to 10 failed/auth requests per hour
    message: "Too many authentication attempts, please try again after an hour",
    standardHeaders: true, 
    legacyHeaders: false,
  });
  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
};
