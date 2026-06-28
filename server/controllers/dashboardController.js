import { sql } from "../db/index.js";

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export const getDashboardSummary = async (req, res) => {
  try {
    const [[customerCount], [leadCount], [taskCount]] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM customers`,
      sql`SELECT COUNT(*) as count FROM leads`,
      sql`SELECT COUNT(*) as count FROM tasks WHERE completed = FALSE`,
    ]);

    const revenueData = await sql`
      SELECT month, amount FROM revenue WHERE year = 2025 ORDER BY month
    `;
    const revenueChart = MONTH_NAMES.map((name, i) => {
      const found = revenueData.find(r => r.month === i + 1);
      return { month: name, revenue: found ? parseFloat(found.amount) : 0 };
    });
    const totalRevenue = revenueData.reduce((s, r) => s + parseFloat(r.amount), 0);

    const customerGrowthRaw = await sql`
      SELECT EXTRACT(MONTH FROM created_at)::int as month, COUNT(*) as count
      FROM customers WHERE created_at IS NOT NULL
      GROUP BY month ORDER BY month
    `;
    const customerGrowthChart = MONTH_NAMES.map((name, i) => {
      const found = customerGrowthRaw.find(c => c.month === i + 1);
      return { month: name, customers: found ? parseInt(found.count) : 0 };
    });

    const leadSourcesRaw = await sql`
      SELECT COALESCE(source,'Unknown') as source, COUNT(*) as count
      FROM leads GROUP BY source ORDER BY count DESC
    `;

    const [taskStats] = await sql`
      SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE completed=TRUE) as completed
      FROM tasks
    `;

    const recentActivity = await sql`
      SELECT * FROM activity_logs ORDER BY created_at DESC LIMIT 10
    `;

    const latestCustomers = await sql`
      SELECT id, name, company, email, status, created_at FROM customers
      ORDER BY created_at DESC NULLS LAST, id DESC LIMIT 5
    `;

    const upcomingTasks = await sql`
      SELECT * FROM tasks
      WHERE completed=FALSE AND due_date >= CURRENT_DATE
      ORDER BY due_date ASC LIMIT 5
    `;

    res.json({
      totalCustomers: parseInt(customerCount.count),
      totalLeads: parseInt(leadCount.count),
      totalRevenue,
      pendingTasks: parseInt(taskCount.count),
      revenueChart,
      customerGrowthChart,
      leadSources: leadSourcesRaw.map(l => ({ name: l.source, value: parseInt(l.count) })),
      taskCompletion: {
        completed: parseInt(taskStats.completed),
        total: parseInt(taskStats.total),
      },
      recentActivity,
      latestCustomers,
      upcomingTasks,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
