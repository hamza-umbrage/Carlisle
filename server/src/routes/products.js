const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const prodQueries = require('../queries/products.queries');

// GET /api/products (public)
router.get('/', optionalAuth, async (req, res, next) => {
  try {
    const { category } = req.query;
    const result = await prodQueries.listProducts({ category });
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:code
router.get('/:code', optionalAuth, async (req, res, next) => {
  try {
    const product = await prodQueries.getProductByCode(req.params.code);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
