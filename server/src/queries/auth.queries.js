const db = require('../config/db');

async function findUserByEmail(email) {
  const result = await db.query(
    'SELECT id, email, password_hash, name, role, phone, is_active FROM users WHERE email = $1',
    [email]
  );
  return result.rows[0] || null;
}

async function findUserById(id) {
  const result = await db.query(
    'SELECT id, email, name, role, phone, is_active, created_at FROM users WHERE id = $1',
    [id]
  );
  return result.rows[0] || null;
}

async function getContractorProfile(userId) {
  const result = await db.query(
    'SELECT id, company_name, contact_name, join_date, rating, specialties FROM contractors WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function getSalesRepProfile(userId) {
  const result = await db.query(
    'SELECT id, territory, customers, active_leads, sales_ytd, quota, top_products FROM sales_reps WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function getInspectorProfile(userId) {
  const result = await db.query(
    'SELECT id, certifications FROM inspectors WHERE user_id = $1',
    [userId]
  );
  return result.rows[0] || null;
}

async function saveRefreshToken(userId, tokenHash, expiresAt) {
  await db.query(
    'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHash, expiresAt]
  );
}

async function findRefreshToken(tokenHash) {
  const result = await db.query(
    'SELECT id, user_id, expires_at FROM refresh_tokens WHERE token_hash = $1 AND expires_at > NOW()',
    [tokenHash]
  );
  return result.rows[0] || null;
}

async function deleteRefreshToken(tokenHash) {
  await db.query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
}

async function deleteAllUserRefreshTokens(userId) {
  await db.query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
}

async function createUser({ email, passwordHash, name, role, phone }) {
  const result = await db.query(
    `INSERT INTO users (email, password_hash, name, role, phone)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, email, name, role, phone, is_active, created_at`,
    [email, passwordHash, name, role, phone || null]
  );
  return result.rows[0];
}

async function createContractorProfile(userId, { companyName, contactName, specialties }) {
  const result = await db.query(
    `INSERT INTO contractors (user_id, company_name, contact_name, specialties)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
    [userId, companyName, contactName, specialties || []]
  );
  return result.rows[0];
}

async function updateUserProfile(userId, { name, phone }) {
  const result = await db.query(
    `UPDATE users SET name = COALESCE($2, name), phone = COALESCE($3, phone)
     WHERE id = $1
     RETURNING id, email, name, role, phone`,
    [userId, name || null, phone || null]
  );
  return result.rows[0] || null;
}

async function updateContractorCompanyName(userId, companyName) {
  await db.query(
    'UPDATE contractors SET company_name = $2 WHERE user_id = $1',
    [userId, companyName]
  );
}

async function updatePassword(userId, passwordHash) {
  await db.query(
    'UPDATE users SET password_hash = $2 WHERE id = $1',
    [userId, passwordHash]
  );
}

async function getUserPasswordHash(userId) {
  const result = await db.query(
    'SELECT password_hash FROM users WHERE id = $1',
    [userId]
  );
  return result.rows[0] ? result.rows[0].password_hash : null;
}

module.exports = {
  findUserByEmail,
  findUserById,
  getContractorProfile,
  getSalesRepProfile,
  getInspectorProfile,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  createUser,
  createContractorProfile,
  updateUserProfile,
  updateContractorCompanyName,
  updatePassword,
  getUserPasswordHash,
};
