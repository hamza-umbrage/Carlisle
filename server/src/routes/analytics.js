const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const analyticsQueries = require('../queries/analytics.queries');
const jobsQueries = require('../queries/jobs.queries');
const inspQueries = require('../queries/inspections.queries');
const authQueries = require('../queries/auth.queries');

// GET /api/analytics/dashboard — returns role-appropriate stats
router.get('/dashboard', authenticate, async (req, res, next) => {
  try {
    const { role, userId } = req.user;

    if (role === 'contractor') {
      const contractorId = await jobsQueries.getContractorIdByUserId(userId);
      if (!contractorId) {
        return res.json({ stats: null });
      }
      const stats = await analyticsQueries.getContractorStats(contractorId);
      return res.json({ stats });
    }

    if (role === 'sales_rep') {
      const profile = await authQueries.getSalesRepProfile(userId);
      if (!profile) {
        return res.json({ stats: null });
      }
      const stats = await analyticsQueries.getSalesRepStats(profile.id);
      return res.json({ stats });
    }

    if (role === 'inspector') {
      const inspectorId = await inspQueries.getInspectorIdByUserId(userId);
      if (!inspectorId) {
        return res.json({ stats: null });
      }
      const stats = await analyticsQueries.getInspectorStats(inspectorId);
      return res.json({ stats });
    }

    if (role === 'ccm_employee') {
      const stats = await analyticsQueries.getSystemStats();
      return res.json({ stats });
    }

    // Guest or unknown
    res.json({ stats: null });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
