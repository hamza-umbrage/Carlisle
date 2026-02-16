const db = require('../config/db');

async function listJobDocuments(jobCode) {
  const result = await db.query(
    `SELECT
      d.id,
      d.type,
      d.name,
      d.url,
      d.uploaded_by AS "uploadedBy",
      d.uploaded_at AS "uploadedAt"
    FROM job_documents d
    JOIN jobs j ON d.job_id = j.id
    WHERE j.code = $1
    ORDER BY d.created_at DESC`,
    [jobCode]
  );
  return { documents: result.rows };
}

async function createJobDocument({ jobCode, type, name, url, filePath, uploadedBy }) {
  const jobResult = await db.query('SELECT id FROM jobs WHERE code = $1', [jobCode]);
  if (jobResult.rows.length === 0) throw Object.assign(new Error('Job not found'), { status: 404 });

  const result = await db.query(
    `INSERT INTO job_documents (job_id, type, name, url, file_path, uploaded_by)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id`,
    [jobResult.rows[0].id, type, name, url, filePath, uploadedBy]
  );
  return result.rows[0];
}

async function deleteJobDocument(docId) {
  const result = await db.query(
    'DELETE FROM job_documents WHERE id = $1 RETURNING file_path',
    [docId]
  );
  return result.rows[0] || null;
}

module.exports = {
  listJobDocuments,
  createJobDocument,
  deleteJobDocument,
};
