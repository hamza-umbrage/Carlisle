const db = require('../config/db');

async function listJobs({ contractorId, status, type, limit = 50, offset = 0 }) {
  let where = [];
  let params = [];
  let idx = 1;

  if (contractorId) {
    where.push(`j.contractor_id = $${idx++}`);
    params.push(contractorId);
  }
  if (status) {
    where.push(`j.status = $${idx++}`);
    params.push(status);
  }
  if (type) {
    where.push(`j.type = $${idx++}`);
    params.push(type);
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const countResult = await db.query(
    `SELECT COUNT(*) FROM jobs j ${whereClause}`,
    params
  );

  const result = await db.query(
    `SELECT
      j.code AS id,
      j.id AS "uuid",
      j.name,
      c.company_name AS contractor,
      j.contractor_id AS "contractorId",
      j.status,
      j.type,
      j.start_date AS "startDate",
      j.estimated_completion AS "estimatedCompletion",
      j.completion_date AS "completionDate",
      j.square_feet AS "squareFeet",
      j.progress
    FROM jobs j
    JOIN contractors c ON j.contractor_id = c.id
    ${whereClause}
    ORDER BY j.created_at DESC
    LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );

  // Attach products and inspections to each job
  for (const job of result.rows) {
    const products = await db.query(
      'SELECT product_name FROM job_products WHERE job_id = $1',
      [job.uuid]
    );
    job.products = products.rows.map((p) => p.product_name);

    const inspections = await db.query(
      `SELECT
        i.type, i.scheduled_date AS date, i.status,
        u.name AS inspector
      FROM inspections i
      LEFT JOIN inspectors insp ON i.inspector_id = insp.id
      LEFT JOIN users u ON insp.user_id = u.id
      WHERE i.job_id = $1
      ORDER BY i.scheduled_date`,
      [job.uuid]
    );
    job.inspections = inspections.rows;

    delete job.uuid;
  }

  return {
    jobs: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

async function getJobByCode(code) {
  const result = await db.query(
    `SELECT
      j.code AS id,
      j.id AS "uuid",
      j.name,
      c.company_name AS contractor,
      j.contractor_id AS "contractorId",
      j.status,
      j.type,
      j.start_date AS "startDate",
      j.estimated_completion AS "estimatedCompletion",
      j.completion_date AS "completionDate",
      j.square_feet AS "squareFeet",
      j.progress
    FROM jobs j
    JOIN contractors c ON j.contractor_id = c.id
    WHERE j.code = $1`,
    [code]
  );

  if (result.rows.length === 0) return null;

  const job = result.rows[0];

  const products = await db.query(
    'SELECT product_name FROM job_products WHERE job_id = $1',
    [job.uuid]
  );
  job.products = products.rows.map((p) => p.product_name);

  const inspections = await db.query(
    `SELECT
      i.type, i.scheduled_date AS date, i.status,
      u.name AS inspector
    FROM inspections i
    LEFT JOIN inspectors insp ON i.inspector_id = insp.id
    LEFT JOIN users u ON insp.user_id = u.id
    WHERE i.job_id = $1
    ORDER BY i.scheduled_date`,
    [job.uuid]
  );
  job.inspections = inspections.rows;

  delete job.uuid;
  return job;
}

async function getContractorIdByUserId(userId) {
  const result = await db.query(
    'SELECT id FROM contractors WHERE user_id = $1',
    [userId]
  );
  return result.rows[0]?.id || null;
}

async function createJob({ code, name, contractorId, type, startDate, estimatedCompletion, squareFeet, products }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const result = await client.query(
      `INSERT INTO jobs (code, name, contractor_id, type, start_date, estimated_completion, square_feet)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING id, code`,
      [code, name, contractorId, type, startDate, estimatedCompletion, squareFeet || 0]
    );

    const jobId = result.rows[0].id;

    if (products && products.length > 0) {
      for (const prod of products) {
        await client.query(
          'INSERT INTO job_products (job_id, product_name) VALUES ($1, $2)',
          [jobId, prod]
        );
      }
    }

    await client.query('COMMIT');
    return result.rows[0].code;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

async function updateJob(code, fields) {
  const sets = [];
  const params = [];
  let idx = 1;

  const allowedFields = {
    name: 'name',
    status: 'status',
    type: 'type',
    startDate: 'start_date',
    estimatedCompletion: 'estimated_completion',
    completionDate: 'completion_date',
    squareFeet: 'square_feet',
    progress: 'progress',
  };

  for (const [key, col] of Object.entries(allowedFields)) {
    if (fields[key] !== undefined) {
      sets.push(`${col} = $${idx++}`);
      params.push(fields[key]);
    }
  }

  if (sets.length === 0) return null;

  params.push(code);
  const result = await db.query(
    `UPDATE jobs SET ${sets.join(', ')} WHERE code = $${idx} RETURNING id, code`,
    params
  );

  // Update products if provided
  if (fields.products && result.rows.length > 0) {
    const jobId = result.rows[0].id;
    await db.query('DELETE FROM job_products WHERE job_id = $1', [jobId]);
    for (const prod of fields.products) {
      await db.query(
        'INSERT INTO job_products (job_id, product_name) VALUES ($1, $2)',
        [jobId, prod]
      );
    }
  }

  return result.rows[0] || null;
}

async function deleteJob(code) {
  const result = await db.query('DELETE FROM jobs WHERE code = $1 RETURNING id', [code]);
  return result.rowCount > 0;
}

async function getJobContractorId(code) {
  const result = await db.query(
    'SELECT contractor_id FROM jobs WHERE code = $1',
    [code]
  );
  return result.rows[0]?.contractor_id || null;
}

module.exports = {
  listJobs,
  getJobByCode,
  getContractorIdByUserId,
  createJob,
  updateJob,
  deleteJob,
  getJobContractorId,
};
