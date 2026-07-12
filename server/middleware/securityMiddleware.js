import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";

export const securityMiddleware = (app) => {
  app.use(helmet());

  const allowedOrigins = [
    process.env.FRONTEND_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean);

  console.log("Allowed Origins:", allowedOrigins);

  app.use(
    cors({
      origin(origin, callback) {
        console.log("Incoming Origin:", origin);

        // Allow requests without Origin (Postman, server-to-server)
        if (!origin) {
          return callback(null, true);
        }

        if (allowedOrigins.includes(origin)) {
          return callback(null, true);
        }

        console.error(`CORS Blocked -> ${origin}`);
        return callback(new Error(`CORS not allowed for origin: ${origin}`));
      },
      credentials: true,
      methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
      allowedHeaders: ["Content-Type", "Authorization"],
    })
  );

  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP. Please try again later.",
  });

  app.use(limiter);

  const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many authentication attempts. Try again in one hour.",
  });

  app.use("/api/auth/login", authLimiter);
  app.use("/api/auth/register", authLimiter);
  app.use("/api/auth/forgot-password", authLimiter);
};