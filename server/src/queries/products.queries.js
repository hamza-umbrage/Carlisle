const db = require('../config/db');

async function listProducts({ category } = {}) {
  let where = '';
  let params = [];

  if (category) {
    where = 'WHERE p.category = $1';
    params.push(category);
  }

  const result = await db.query(
    `SELECT
      p.code AS id,
      p.id AS "uuid",
      p.name,
      p.category,
      p.description,
      p.spec_thickness,
      p.spec_width,
      p.spec_color,
      p.spec_warranty
    FROM products p
    ${where}
    ORDER BY p.name`,
    params
  );

  // Format to match frontend expectations
  const products = [];
  for (const row of result.rows) {
    const docs = await db.query(
      `SELECT name, file_type AS type, file_size AS size, url
       FROM product_documents WHERE product_id = $1`,
      [row.uuid]
    );

    products.push({
      id: row.id,
      name: row.name,
      category: row.category,
      description: row.description,
      specifications: {
        thickness: row.spec_thickness,
        width: row.spec_width,
        color: row.spec_color,
        warranty: row.spec_warranty,
      },
      documents: docs.rows,
    });
  }

  return { products };
}

async function getProductByCode(code) {
  const result = await db.query(
    `SELECT
      p.code AS id,
      p.id AS "uuid",
      p.name,
      p.category,
      p.description,
      p.spec_thickness,
      p.spec_width,
      p.spec_color,
      p.spec_warranty
    FROM products p
    WHERE p.code = $1`,
    [code]
  );

  if (result.rows.length === 0) return null;

  const row = result.rows[0];
  const docs = await db.query(
    `SELECT name, file_type AS type, file_size AS size, url
     FROM product_documents WHERE product_id = $1`,
    [row.uuid]
  );

  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description,
    specifications: {
      thickness: row.spec_thickness,
      width: row.spec_width,
      color: row.spec_color,
      warranty: row.spec_warranty,
    },
    documents: docs.rows,
  };
}

module.exports = {
  listProducts,
  getProductByCode,
};
