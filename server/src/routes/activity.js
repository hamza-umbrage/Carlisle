const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const activityQueries = require('../queries/activity.queries');

// GET /api/activity
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { limit = 20 } = req.query;

    // Admin sees all, others see only their own
    const userId = req.user.role === 'ccm_employee' ? null : req.user.userId;

    const result = await activityQueries.listActivity({
      userId,
      limit: parseInt(limit, 10),
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
