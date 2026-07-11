import { sql } from "../db/index.js";
import { logActivity } from "../utils/logger.js";

// @desc    Generate AI insights for a customer
// @route   GET /api/ai/customers/:id/ai-assist
// @access  Private
export const getCustomerAIAssist = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Fetch customer details
    const [customer] = await sql`SELECT * FROM customers WHERE id = ${parseInt(id)}`;
    if (!customer) {
      return res.status(404).json({ error: "Customer not found" });
    }

    // 2. Fetch customer notes
    const notes = await sql`
      SELECT * FROM customer_notes 
      WHERE customer_id = ${parseInt(id)} 
      ORDER BY created_at DESC
    `;

    // 3. Fetch customer leads
    const custName = customer.name?.toLowerCase();
    const custCompany = customer.company?.toLowerCase();
    const allLeads = await sql`SELECT * FROM leads LIMIT 200`;
    const leads = allLeads.filter(
      (l) =>
        (custCompany && l.company?.toLowerCase() === custCompany) ||
        l.name?.toLowerCase() === custName
    );

    // 4. Fetch customer tasks
    const allTasks = await sql`SELECT * FROM tasks LIMIT 200`;
    const tasks = allTasks.filter(
      (t) =>
        custCompany &&
        t.description?.toLowerCase().includes(custCompany)
    );

    // 5. Generate AI summary
    const apiKey = process.env.GEMINI_API_KEY;
    let aiContent = "";

    if (apiKey) {
      // Create prompt for Gemini
      const prompt = `You are an AI-powered CRM assistant. Summarize the customer interaction history and recommend follow-up actions.
  
Customer Info:
Name: ${customer.name}
Email: ${customer.email}
Phone: ${customer.phone || "N/A"}
Company: ${customer.company || "N/A"}
Status: ${customer.status}

Interaction Notes:
${notes.map((n) => `- [${new Date(n.created_at).toISOString().split("T")[0]}] ${n.note}`).join("\n") || "No notes recorded."}

Related Leads:
${leads.map((l) => `- Lead: ${l.name}, Status: ${l.status}, Priority: ${l.priority}`).join("\n") || "No leads."}

Related Tasks:
${tasks.map((t) => `- Task: ${t.title}, Status: ${t.status}, Due: ${t.due_date || "N/A"}`).join("\n") || "No tasks."}

Please provide the summary in clean, readable Markdown format with two main sections:
1. ### Account Summary
   (A concise summary of customer history and current status)
2. ### Suggested Next Steps
   (Actionable recommendations with specific tasks and timelines)`;

      try {
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const resData = await response.json();
        aiContent = resData.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (err) {
        console.error("Gemini API call failed, falling back to heuristic engine:", err);
        aiContent = getHeuristicAIAssistance(customer, notes, leads, tasks);
      }
    } else {
      // Fallback
      aiContent = getHeuristicAIAssistance(customer, notes, leads, tasks);
    }

    // Log the AI request activity
    await logActivity("ai_assist_generated", `Generated AI insights for customer "${customer.name}"`, "customer", customer.id, req.user.id);

    res.json({
      success: true,
      analysis: aiContent,
      source: apiKey ? "Gemini 2.5 Flash" : "Local Heuristic Engine",
    });
  } catch (error) {
    console.error("Error generating AI assistance:", error);
    res.status(500).json({ error: "Failed to generate AI insights" });
  }
};

// Heuristic fallback text generator
const getHeuristicAIAssistance = (customer, notes, leads, tasks) => {
  const notesSummary =
    notes.length > 0
      ? notes.map((n) => `On ${new Date(n.created_at).toLocaleDateString()}, notes state: "${n.note}"`).join("\n\n")
      : "No interaction notes have been logged for this customer.";

  const activeLeads = leads.filter((l) => l.status !== "Won" && l.status !== "Lost");
  const pendingTasks = tasks.filter((t) => !t.completed);

  return `### Account Summary

**${customer.name}** is currently classified as **${customer.status}**. They are associated with the organization **${customer.company || "Independent Client"}** and were added to the CRM database on **${new Date(customer.created_at).toLocaleDateString()}**.

* **Interaction Summary**: ${notes.length} history log(s) available. 
  ${notesSummary}
* **Sales Pipeline**: There are **${leads.length}** lead(s) associated with this account. ${
    activeLeads.length > 0
      ? `Attention is required on ${activeLeads.length} active lead(s) in progress.`
      : "No active leads require immediate attention."
  }
* **Task Checklist**: **${pendingTasks.length}** task(s) are currently pending completion.

### Suggested Next Steps

1. **Verify Contact Profile**: Call the customer at \`${customer.phone || "No phone logged"}\` or email \`${customer.email}\` to update key organizational details.
2. **Address Open Pipeline Items**: ${
    activeLeads.length > 0
      ? `Review the lead status of **"${activeLeads[0].name}"** (*${activeLeads[0].status}* stage) and move it forward.`
      : "Create a new lead opportunity if there are potential upgrade or service renewal requirements."
  }
3. **Execute Task List**: ${
    pendingTasks.length > 0
      ? `Execute task **"${pendingTasks[0].title}"** which is currently pending.`
      : "Schedule a routine customer satisfaction touchpoint task for 30 days from now."
  }
4. **Log Outreach Notes**: Continue adding notes to their timeline to feed relevant data to the AI CRM Assistant.`;
};
