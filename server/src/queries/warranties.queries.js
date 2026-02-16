const db = require('../config/db');

async function listWarranties({ contractorId, status }) {
  let where = [];
  let params = [];
  let idx = 1;

  if (contractorId) {
    where.push(`w.contractor_id = $${idx++}`);
    params.push(contractorId);
  }
  if (status) {
    where.push(`w.status = $${idx++}`);
    params.push(status);
  }

  const whereClause = where.length > 0 ? 'WHERE ' + where.join(' AND ') : '';

  const result = await db.query(
    `SELECT
      w.code AS id,
      w.id AS "uuid",
      j.code AS "jobId",
      w.registration_date AS "registrationDate",
      w.warranty_type AS "warrantyType",
      w.duration,
      w.status,
      c.company_name AS contractor,
      w.square_feet AS "squareFeet"
    FROM warranties w
    JOIN jobs j ON w.job_id = j.id
    JOIN contractors c ON w.contractor_id = c.id
    ${whereClause}
    ORDER BY w.registration_date DESC`,
    params
  );

  // Attach products
  for (const warranty of result.rows) {
    const products = await db.query(
      'SELECT product_name FROM warranty_products WHERE warranty_id = $1',
      [warranty.uuid]
    );
    warranty.products = products.rows.map((p) => p.product_name);
    delete warranty.uuid;
  }

  return { warranties: result.rows };
}

async function getWarrantyByCode(code) {
  const result = await db.query(
    `SELECT
      w.code AS id,
      w.id AS "uuid",
      j.code AS "jobId",
      w.registration_date AS "registrationDate",
      w.warranty_type AS "warrantyType",
      w.duration,
      w.status,
      c.company_name AS contractor,
      w.square_feet AS "squareFeet"
    FROM warranties w
    JOIN jobs j ON w.job_id = j.id
    JOIN contractors c ON w.contractor_id = c.id
    WHERE w.code = $1`,
    [code]
  );

  if (result.rows.length === 0) return null;

  const warranty = result.rows[0];
  const products = await db.query(
    'SELECT product_name FROM warranty_products WHERE warranty_id = $1',
    [warranty.uuid]
  );
  warranty.products = products.rows.map((p) => p.product_name);
  delete warranty.uuid;

  return warranty;
}

async function createWarranty({ code, jobCode, contractorId, warrantyType, duration, products, squareFeet }) {
  const client = await db.getClient();
  try {
    await client.query('BEGIN');

    const jobResult = await client.query('SELECT id FROM jobs WHERE code = $1', [jobCode]);
    if (jobResult.rows.length === 0) throw Object.assign(new Error('Job not found'), { status: 404 });

    const result = await client.query(
      `INSERT INTO warranties (code, job_id, contractor_id, warranty_type, duration, status, square_feet)
       VALUES ($1, $2, $3, $4, $5, 'Active', $6)
       RETURNING id, code`,
      [code, jobResult.rows[0].id, contractorId, warrantyType, duration, squareFeet || 0]
    );

    const warrantyId = result.rows[0].id;

    if (products && products.length > 0) {
      for (const prod of products) {
        await client.query(
          'INSERT INTO warranty_products (warranty_id, product_name) VALUES ($1, $2)',
          [warrantyId, prod]
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

async function updateWarranty(code, fields) {
  const sets = [];
  const params = [];
  let idx = 1;

  if (fields.status !== undefined) { sets.push(`status = $${idx++}`); params.push(fields.status); }
  if (fields.duration !== undefined) { sets.push(`duration = $${idx++}`); params.push(fields.duration); }
  if (fields.warrantyType !== undefined) { sets.push(`warranty_type = $${idx++}`); params.push(fields.warrantyType); }

  if (sets.length === 0) return null;

  params.push(code);
  const result = await db.query(
    `UPDATE warranties SET ${sets.join(', ')} WHERE code = $${idx} RETURNING code`,
    params
  );
  return result.rows[0] || null;
}

async function deleteWarranty(code) {
  const result = await db.query('DELETE FROM warranties WHERE code = $1 RETURNING id', [code]);
  return result.rowCount > 0;
}

module.exports = {
  listWarranties,
  getWarrantyByCode,
  createWarranty,
  updateWarranty,
  deleteWarranty,
};
