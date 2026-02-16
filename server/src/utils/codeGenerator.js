const db = require('../config/db');

async function generateCode(prefix, table, codeColumn = 'code') {
  const year = new Date().getFullYear();
  const pattern = `${prefix}${year}-%`;

  const result = await db.query(
    `SELECT ${codeColumn} FROM ${table} WHERE ${codeColumn} LIKE $1 ORDER BY ${codeColumn} DESC LIMIT 1`,
    [pattern]
  );

  let nextNum = 1;
  if (result.rows.length > 0) {
    const lastCode = result.rows[0][codeColumn];
    const lastNum = parseInt(lastCode.split('-').pop(), 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${prefix}${year}-${String(nextNum).padStart(4, '0')}`;
}

module.exports = { generateCode };
