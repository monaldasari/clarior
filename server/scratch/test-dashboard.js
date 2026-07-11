import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET;

// Create a token for user id=1 (admin)
const token = jwt.sign({ id: 1, role: "Super Admin" }, JWT_SECRET, { expiresIn: "1h" });

const test = async () => {
  try {
    const res = await fetch(`http://localhost:${PORT}/dashboard/summary`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    console.log("Status:", res.status);
    if (res.status === 200) {
      console.log("✅ Dashboard API returned successfully!");
      console.log("Keys:", Object.keys(data).join(", "));
      console.log("totalCustomers:", data.totalCustomers);
      console.log("totalLeads:", data.totalLeads);
      console.log("totalRevenue:", data.totalRevenue);
      console.log("pendingTasks:", data.pendingTasks);
      console.log("revenueChart entries:", data.revenueChart?.length);
      console.log("latestCustomers:", data.latestCustomers?.length);
      console.log("upcomingTasks:", data.upcomingTasks?.length);
    } else {
      console.error("❌ Dashboard API failed:", data);
    }
  } catch (err) {
    console.error("❌ Fetch error:", err.message);
  }
};

test();
