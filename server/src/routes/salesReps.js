const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const salesRepsQueries = require('../queries/salesReps.queries');

// GET /api/sales-reps
router.get('/', authenticate, async (req, res, next) => {
  try {
    const result = await salesRepsQueries.listSalesReps();
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/sales-reps/:id
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const rep = await salesRepsQueries.getSalesRepById(req.params.id);
    if (!rep) {
      return res.status(404).json({ error: 'Sales rep not found' });
    }
    res.json(rep);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
