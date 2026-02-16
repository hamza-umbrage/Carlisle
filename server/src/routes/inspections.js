const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { requireFields } = require('../middleware/validate');
const inspQueries = require('../queries/inspections.queries');
const jobsQueries = require('../queries/jobs.queries');
const { generateCode } = require('../utils/codeGenerator');

// GET /api/inspections
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, job_id } = req.query;
    let inspectorId = null;

    // Inspectors see only their assigned inspections
    if (req.user.role === 'inspector') {
      inspectorId = await inspQueries.getInspectorIdByUserId(req.user.userId);
    }

    // Contractors see inspections for their jobs only
    if (req.user.role === 'contractor') {
      const contractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
      // For contractors, we filter by their jobs — get all their job codes
      const jobsResult = await jobsQueries.listJobs({ contractorId, limit: 1000 });
      const allInspections = [];

      for (const job of jobsResult.jobs) {
        const result = await inspQueries.listInspections({ jobId: job.id, status });
        allInspections.push(...result.inspections);
      }

      return res.json({ inspections: allInspections });
    }

    const result = await inspQueries.listInspections({
      jobId: job_id,
      inspectorId,
      status,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/inspections/:code
router.get('/:code', authenticate, async (req, res, next) => {
  try {
    const inspection = await inspQueries.getInspectionByCode(req.params.code);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (err) {
    next(err);
  }
});

// POST /api/inspections
router.post('/',
  authenticate,
  authorize('contractor', 'ccm_employee'),
  requireFields(['jobId', 'type']),
  async (req, res, next) => {
    try {
      const { jobId, type, scheduledDate, checklist } = req.body;
      const code = await generateCode('INS', 'inspections');

      const inspCode = await inspQueries.createInspection({
        code,
        jobCode: jobId,
        type,
        scheduledDate,
        checklist,
      });

      const inspection = await inspQueries.getInspectionByCode(inspCode);
      res.status(201).json(inspection);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/inspections/:code
router.put('/:code',
  authenticate,
  authorize('inspector', 'ccm_employee'),
  async (req, res, next) => {
    try {
      const updated = await inspQueries.updateInspection(req.params.code, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Inspection not found or no changes' });
      }

      const inspection = await inspQueries.getInspectionByCode(req.params.code);
      res.json(inspection);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/inspections/:code
router.delete('/:code',
  authenticate,
  authorize('ccm_employee'),
  async (req, res, next) => {
    try {
      const deleted = await inspQueries.deleteInspection(req.params.code);
      if (!deleted) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
      res.json({ message: 'Inspection deleted' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
