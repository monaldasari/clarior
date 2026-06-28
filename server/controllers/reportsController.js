import { sql } from "../db/index.js";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const getReportsOverview = async (req, res) => {
  try {
    const { year = 2025 } = req.query;

    const revenueRaw = await sql`
      SELECT month, amount FROM revenue WHERE year=${parseInt(year)} ORDER BY month
    `;
    const revenueChart = MONTH_NAMES.map((name, i) => {
      const found = revenueRaw.find(r => r.month === i + 1);
      return { month: name, revenue: found ? parseFloat(found.amount) : 0 };
    });

    const customersByMonth = await sql`
      SELECT EXTRACT(MONTH FROM created_at)::int as month, COUNT(*) as count
      FROM customers WHERE created_at IS NOT NULL GROUP BY month ORDER BY month
    `;
    const customerGrowth = MONTH_NAMES.map((name, i) => {
      const found = customersByMonth.find(c => c.month === i + 1);
      return { month: name, customers: found ? parseInt(found.count) : 0 };
    });

    const leadConversion = await sql`SELECT status, COUNT(*) as count FROM leads GROUP BY status`;
    const taskStats = await sql`SELECT status, COUNT(*) as count FROM tasks GROUP BY status`;
    const topCustomers = await sql`
      SELECT name, company, email, created_at FROM customers
      ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 5
    `;

    res.json({
      revenueChart,
      customerGrowth,
      leadConversion: leadConversion.map(l => ({ name: l.status, value: parseInt(l.count) })),
      taskStats: taskStats.map(t => ({ name: t.status, value: parseInt(t.count) })),
      topCustomers,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
