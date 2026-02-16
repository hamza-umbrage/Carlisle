const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { requireFields } = require('../middleware/validate');
const warQueries = require('../queries/warranties.queries');
const jobsQueries = require('../queries/jobs.queries');
const { generateCode } = require('../utils/codeGenerator');

// GET /api/warranties
router.get('/', authenticate, async (req, res, next) => {
  try {
    const { status } = req.query;
    let contractorId = null;

    if (req.user.role === 'contractor') {
      contractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
    }

    const result = await warQueries.listWarranties({
      contractorId: contractorId || req.query.contractor_id,
      status,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/warranties/:code
router.get('/:code', authenticate, async (req, res, next) => {
  try {
    const warranty = await warQueries.getWarrantyByCode(req.params.code);
    if (!warranty) {
      return res.status(404).json({ error: 'Warranty not found' });
    }
    res.json(warranty);
  } catch (err) {
    next(err);
  }
});

// POST /api/warranties
router.post('/',
  authenticate,
  authorize('contractor', 'sales_rep', 'ccm_employee'),
  requireFields(['jobId', 'warrantyType', 'duration']),
  async (req, res, next) => {
    try {
      const { jobId, warrantyType, duration, products, squareFeet } = req.body;

      let contractorId;
      if (req.user.role === 'contractor') {
        contractorId = await jobsQueries.getContractorIdByUserId(req.user.userId);
      } else {
        contractorId = req.body.contractorId;
      }

      if (!contractorId) {
        return res.status(400).json({ error: 'Contractor ID required' });
      }

      const code = await generateCode('WAR', 'warranties');
      const warCode = await warQueries.createWarranty({
        code,
        jobCode: jobId,
        contractorId,
        warrantyType,
        duration,
        products,
        squareFeet,
      });

      const warranty = await warQueries.getWarrantyByCode(warCode);
      res.status(201).json(warranty);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/warranties/:code
router.put('/:code',
  authenticate,
  authorize('ccm_employee'),
  async (req, res, next) => {
    try {
      const updated = await warQueries.updateWarranty(req.params.code, req.body);
      if (!updated) {
        return res.status(404).json({ error: 'Warranty not found or no changes' });
      }
      const warranty = await warQueries.getWarrantyByCode(req.params.code);
      res.json(warranty);
    } catch (err) {
      next(err);
    }
  }
);

// DELETE /api/warranties/:code
router.delete('/:code',
  authenticate,
  authorize('ccm_employee'),
  async (req, res, next) => {
    try {
      const deleted = await warQueries.deleteWarranty(req.params.code);
      if (!deleted) {
        return res.status(404).json({ error: 'Warranty not found' });
      }
      res.json({ message: 'Warranty deleted' });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
