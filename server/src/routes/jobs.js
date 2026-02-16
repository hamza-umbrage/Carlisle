const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { requireFields } = require('../middleware/validate');
const jobsQueries = require('../queries/jobs.queries');
const { generateCode } = require('../utils/codeGenerator');

// GET /api/jobs
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status, type, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    let contractorId = null;

    // Contractors only see their own jobs
    if (req.user.role === 'contractor') {
      contractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
      if (!contractorId) {
        return res.json({ jobs: [], total: 0 });
      }
    }

    const result = await jobsQueries.listJobs({
      contractorId: contractorId || req.query.contractor_id,
      status,
      type,
      limit: parseInt(limit, 10),
      offset,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/jobs/:code
router.get('/:code', authenticate, async (req, res, next) => {
  try {
    const job = await jobsQueries.getJobByCode(req.params.code);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Contractors can only see their own jobs
    if (req.user.role === 'contractor') {
      const myContractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
      if (job.contractorId !== myContractorId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    res.json(job);
  } catch (err) {
    next(err);
  }
});

// POST /api/jobs
router.post('/',
  authenticate,
  authorize('contractor', 'ccm_employee'),
  requireFields(['name', 'type']),
  async (req, res, next) => {
    try {
      const { name, type, startDate, estimatedCompletion, squareFeet, products } = req.body;

      let contractorId;
      if (req.user.role === 'contractor') {
        contractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
        if (!contractorId) {
          return res.status(400).json({ error: 'Contractor profile not found' });
        }
      } else {
        contractorId = req.body.contractorId;
        if (!contractorId) {
          return res.status(400).json({ error: 'contractorId is required for admin job creation' });
        }
      }

      const code = await generateCode('JOB', 'jobs');
      const jobCode = await jobsQueries.createJob({
        code,
        name,
        contractorId,
        type,
        startDate,
        estimatedCompletion,
        squareFeet,
        products,
      });

      const job = await jobsQueries.getJobByCode(jobCode);
      res.status(201).json(job);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/jobs/:code
router.put('/:code', authenticate, async (req, res, next) => {
  try {
    const { code } = req.params;

    // Check ownership for contractors
    if (req.user.role === 'contractor') {
      const myContractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
      const jobContractorId = await jobsQueries.getJobContractorId(code);
      if (myContractorId !== jobContractorId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'ccm_employee') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const updated = await jobsQueries.updateJob(code, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Job not found or no changes' });
    }

    const job = await jobsQueries.getJobByCode(code);
    res.json(job);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/jobs/:code
router.delete('/:code', authenticate, async (req, res, next) => {
  try {
    const { code } = req.params;

    if (req.user.role === 'contractor') {
      const myContractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
      const jobContractorId = await jobsQueries.getJobContractorId(code);
      if (myContractorId !== jobContractorId) {
        return res.status(403).json({ error: 'Access denied' });
      }
    } else if (req.user.role !== 'ccm_employee') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const deleted = await jobsQueries.deleteJob(code);
    if (!deleted) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({ message: 'Job deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
