const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const { requireFields, validateEmail } = require('../middleware/validate');
const usersQueries = require('../queries/users.queries');
const passwordUtil = require('../utils/password');

// All user management routes require ccm_employee (admin) role

// GET /api/users
router.get('/', authenticate, authorize('ccm_employee'), async (req, res, next) => {
  try {
    const { role, page = 1, limit = 50 } = req.query;
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10);

    const result = await usersQueries.listUsers({
      role,
      limit: parseInt(limit, 10),
      offset,
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/users
router.post('/',
  authenticate,
  authorize('ccm_employee'),
  requireFields(['email', 'password', 'name', 'role']),
  validateEmail,
  async (req, res, next) => {
    try {
      const { email, password, name, role, phone } = req.body;
      const passwordHash = await passwordUtil.hash(password);

      const user = await usersQueries.createUser({
        email: email.toLowerCase().trim(),
        passwordHash,
        name,
        role,
        phone,
      });

      res.status(201).json({ user });
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/users/:id
router.put('/:id', authenticate, authorize('ccm_employee'), async (req, res, next) => {
  try {
    const user = await usersQueries.updateUser(req.params.id, req.body);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ user });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/users/:id
router.delete('/:id', authenticate, authorize('ccm_employee'), async (req, res, next) => {
  try {
    const deleted = await usersQueries.deleteUser(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
