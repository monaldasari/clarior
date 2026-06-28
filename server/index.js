import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { neon } from "@neondatabase/serverless";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const sql = neon(process.env.DATABASE_URL);

app.get("/", (req, res) => {
  res.send("🚀 Clarior Backend Running");
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await sql`SELECT NOW()`;
    res.json({
      success: true,
      time: result[0].now,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

const PORT = process.env.PORT || 5000;
app.get("/customers", async (req, res) => {
  try {
    const customers = await sql`
      SELECT * FROM customers
      ORDER BY id;
    `;

    res.json(customers);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.post("/customers", async (req, res) => {
  try {
    const { name, email, company, status } = req.body;

    const result = await sql`
      INSERT INTO customers (name, email, company, status)
      VALUES (${name}, ${email}, ${company}, ${status})
      RETURNING *;
    `;

    res.status(201).json(result[0]);
  } catch (err) {
    res.status(500).json({
      error: err.message,
    });
  }
});