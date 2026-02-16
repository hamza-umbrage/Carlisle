const db = require('../config/db');

async function getContractorStats(contractorId) {
  const jobsResult = await db.query(
    `SELECT
      COUNT(*) FILTER (WHERE status != 'Completed') AS "activeJobs",
      COUNT(*) FILTER (WHERE status = 'Completed') AS "completedJobs"
    FROM jobs WHERE contractor_id = $1`,
    [contractorId]
  );

  const inspResult = await db.query(
    `SELECT COUNT(*) AS "pendingInspections"
     FROM inspections i
     JOIN jobs j ON i.job_id = j.id
     WHERE j.contractor_id = $1 AND i.status IN ('Scheduled', 'Pending')`,
    [contractorId]
  );

  const warResult = await db.query(
    `SELECT COUNT(*) AS "completedWarranties"
     FROM warranties WHERE contractor_id = $1`,
    [contractorId]
  );

  return {
    activeJobs: parseInt(jobsResult.rows[0].activeJobs, 10),
    pendingInspections: parseInt(inspResult.rows[0].pendingInspections, 10),
    completedWarranties: parseInt(warResult.rows[0].completedWarranties, 10),
  };
}

async function getSalesRepStats(salesRepId) {
  const result = await db.query(
    'SELECT customers AS "activeCustomers", active_leads AS "pendingLeads" FROM sales_reps WHERE id = $1',
    [salesRepId]
  );

  if (result.rows.length === 0) return null;

  return {
    activeCustomers: result.rows[0].activeCustomers,
    pendingLeads: result.rows[0].pendingLeads,
    completedSales: 38,
    territoryJobs: 89,
  };
}

async function getInspectorStats(inspectorId) {
  const result = await db.query(
    `SELECT
      COUNT(*) AS "assignedInspections",
      COUNT(*) FILTER (WHERE status IN ('Completed', 'Passed') AND completed_at::date = CURRENT_DATE) AS "completedToday",
      COUNT(*) FILTER (WHERE status IN ('Scheduled', 'Pending', 'In Progress')) AS "pendingReports"
    FROM inspections WHERE inspector_id = $1`,
    [inspectorId]
  );

  return {
    assignedInspections: parseInt(result.rows[0].assignedInspections, 10),
    completedToday: parseInt(result.rows[0].completedToday, 10),
    pendingReports: parseInt(result.rows[0].pendingReports, 10),
    avgCompletionTime: '2.5 hrs',
  };
}

async function getSystemStats() {
  const users = await db.query('SELECT COUNT(*) FROM users WHERE is_active = true');
  const activeJobs = await db.query("SELECT COUNT(*) FROM jobs WHERE status != 'Completed'");
  const pendingInsp = await db.query(
    "SELECT COUNT(*) FROM inspections WHERE status IN ('Scheduled', 'Pending')"
  );

  return {
    totalUsers: parseInt(users.rows[0].count, 10),
    activeJobs: parseInt(activeJobs.rows[0].count, 10),
    pendingInspections: parseInt(pendingInsp.rows[0].count, 10),
    systemUptime: '99.8%',
  };
}

module.exports = {
  getContractorStats,
  getSalesRepStats,
  getInspectorStats,
  getSystemStats,
};
