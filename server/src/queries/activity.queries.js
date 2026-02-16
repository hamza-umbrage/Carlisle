const db = require('../config/db');

async function listActivity({ userId, limit = 20 } = {}) {
  let where = '';
  let params = [];

  if (userId) {
    where = 'WHERE a.user_id = $1';
    params.push(userId);
  }

  const result = await db.query(
    `SELECT
      a.created_at AS timestamp,
      a.type,
      a.user_name AS "user",
      a.action,
      a.details
    FROM activity_timeline a
    ${where}
    ORDER BY a.created_at DESC
    LIMIT $${params.length + 1}`,
    [...params, limit]
  );

  return { activities: result.rows };
}

async function createActivity({ userId, type, userName, action, details }) {
  await db.query(
    `INSERT INTO activity_timeline (user_id, type, user_name, action, details)
     VALUES ($1, $2, $3, $4, $5)`,
    [userId || null, type, userName, action, details]
  );
}

module.exports = {
  listActivity,
  createActivity,
};
