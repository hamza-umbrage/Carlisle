const db = require('../config/db');

async function listInspections({ jobId, inspectorId, status }) {
  let where = [];
  let params = [];
  let idx = 1;

  if (jobId) {
    where.push(`j.code = $${idx++}`);
    params.push(jobId);
  }
  if (inspectorId) {
    where.push(`i.inspector_id = $${idx++}`);
    params.push(inspectorId);
  }
  if (status) {
    where.push(`i.status = $${idx++}`);
    params.push(status);
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const result = await db.query(
    `SELECT
      i.code AS id,
      j.code AS "jobId",
      i.type,
      i.status,
      i.scheduled_date AS "scheduledDate",
      u.name AS inspector,
      insp.id AS "inspectorId",
      i.checklist,
      i.notes
    FROM inspections i
    JOIN jobs j ON i.job_id = j.id
    LEFT JOIN inspectors insp ON i.inspector_id = insp.id
    LEFT JOIN users u ON insp.user_id = u.id
    ${whereClause}
    ORDER BY i.scheduled_date DESC`,
    params
  );

  return { inspections: result.rows };
}

async function getInspectionByCode(code) {
  const result = await db.query(
    `SELECT
      i.code AS id,
      j.code AS "jobId",
      i.type,
      i.status,
      i.scheduled_date AS "scheduledDate",
      u.name AS inspector,
      insp.id AS "inspectorId",
      i.checklist,
      i.notes,
      i.completed_at AS "completedAt"
    FROM inspections i
    JOIN jobs j ON i.job_id = j.id
    LEFT JOIN inspectors insp ON i.inspector_id = insp.id
    LEFT JOIN users u ON insp.user_id = u.id
    WHERE i.code = $1`,
    [code]
  );
  return result.rows[0] || null;
}

async function createInspection({ code, jobCode, inspectorId, type, scheduledDate, checklist }) {
  // Resolve job UUID from code
  const jobResult = await db.query('SELECT id FROM jobs WHERE code = $1', [jobCode]);
  if (jobResult.rows.length === 0) throw Object.assign(new Error('Job not found'), { status: 404 });

  const result = await db.query(
    `INSERT INTO inspections (code, job_id, inspector_id, type, scheduled_date, checklist)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING code`,
    [code, jobResult.rows[0].id, inspectorId || null, type, scheduledDate, checklist || []]
  );

  return result.rows[0].code;
}

async function updateInspection(code, fields) {
  const sets = [];
  const params = [];
  let idx = 1;

  if (fields.status !== undefined) { sets.push(`status = $${idx++}`); params.push(fields.status); }
  if (fields.notes !== undefined) { sets.push(`notes = $${idx++}`); params.push(fields.notes); }
  if (fields.checklist !== undefined) { sets.push(`checklist = $${idx++}`); params.push(fields.checklist); }
  if (fields.status === 'Completed' || fields.status === 'Passed') {
    sets.push(`completed_at = NOW()`);
  }

  if (sets.length === 0) return null;

  params.push(code);
  const result = await db.query(
    `UPDATE inspections SET ${sets.join(', ')} WHERE code = $${idx} RETURNING code`,
    params
  );
  return result.rows[0] || null;
}

async function deleteInspection(code) {
  const result = await db.query('DELETE FROM inspections WHERE code = $1 RETURNING id', [code]);
  return result.rowCount > 0;
}

async function getInspectorIdByUserId(userId) {
  const result = await db.query('SELECT id FROM inspectors WHERE user_id = $1', [userId]);
  return result.rows[0]?.id || null;
}

module.exports = {
  listInspections,
  getInspectionByCode,
  createInspection,
  updateInspection,
  deleteInspection,
  getInspectorIdByUserId,
};
