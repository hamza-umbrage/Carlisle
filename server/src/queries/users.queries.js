const db = require('../config/db');

async function listUsers({ role, limit = 50, offset = 0 } = {}) {
  let where = '';
  let params = [];
  let idx = 1;

  if (role) {
    where = `WHERE role = $${idx++}`;
    params.push(role);
  }

  const countResult = await db.query(
    `SELECT COUNT(*) FROM users ${where}`,
    params
  );

  const result = await db.query(
    `SELECT id, email, name, role, phone, is_active, created_at
     FROM users ${where}
     ORDER BY created_at DESC
     LIMIT $${idx++} OFFSET $${idx++}`,
    [...params, limit, offset]
  );

  return {
    users: result.rows,
    total: parseInt(countResult.rows[0].count, 10),
  };
}

async function createUser({ email, passwordHash, name, role, phone }) {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, name, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, phone, is_active, created_at`,
    [email, passwordHash, name, role, phone]
  );
  return result.rows[0];
}

async function updateUser(id, fields) {
  const sets = [];
  const params = [];
  let idx = 1;

  if (fields.name !== undefined) { sets.push(`name = $${idx++}`); params.push(fields.name); }
  if (fields.email !== undefined) { sets.push(`email = $${idx++}`); params.push(fields.email); }
  if (fields.phone !== undefined) { sets.push(`phone = $${idx++}`); params.push(fields.phone); }
  if (fields.role !== undefined) { sets.push(`role = $${idx++}`); params.push(fields.role); }
  if (fields.is_active !== undefined) { sets.push(`is_active = $${idx++}`); params.push(fields.is_active); }

  if (sets.length === 0) return null;

  params.push(id);
  const result = await db.query(
    `UPDATE users SET ${sets.join(', ')} WHERE id = $${idx}
     RETURNING id, email, name, role, phone, is_active`,
    params
  );
  return result.rows[0] || null;
}

async function deleteUser(id) {
  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  return result.rowCount > 0;
}

module.exports = {
  listUsers,
  createUser,
  updateUser,
  deleteUser,
};
