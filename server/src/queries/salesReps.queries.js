const db = require('../config/db');

async function listSalesReps() {
  const result = await db.query(
    `SELECT
      s.id,
      u.name,
      u.email,
      u.phone,
      s.territory,
      s.customers,
      s.active_leads AS "activeLeads",
      s.sales_ytd AS "salesYTD",
      s.quota,
      s.top_products AS "topProducts"
    FROM sales_reps s
    JOIN users u ON s.user_id = u.id
    WHERE u.is_active = true
    ORDER BY u.name`
  );

  return { salesReps: result.rows };
}

async function getSalesRepById(id) {
  const result = await db.query(
    `SELECT
      s.id,
      u.name,
      u.email,
      u.phone,
      s.territory,
      s.customers,
      s.active_leads AS "activeLeads",
      s.sales_ytd AS "salesYTD",
      s.quota,
      s.top_products AS "topProducts"
    FROM sales_reps s
    JOIN users u ON s.user_id = u.id
    WHERE s.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

module.exports = {
  listSalesReps,
  getSalesRepById,
};
