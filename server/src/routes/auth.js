const express = require('express');
const router = express.Router();
const { requireFields, validateEmail } = require('../middleware/validate');
const { authenticate } = require('../middleware/auth');
const passwordUtil = require('../utils/password');
const jwtUtil = require('../utils/jwt');
const authQueries = require('../queries/auth.queries');

// Role key mapping: DB enum -> frontend roleConfig key
const roleKeyMap = {
  contractor: 'contractor',
  sales_rep: 'sales-rep',
  ccm_employee: 'ccm-employee',
  inspector: 'inspector',
  guest: 'guest',
};

// Roles that users can self-register as
const SELF_REGISTER_ROLES = ['contractor', 'inspector'];

// POST /api/auth/register
router.post('/register',
  requireFields(['email', 'password', 'name', 'role']),
  validateEmail,
  async (req, res, next) => {
    try {
      const { email, password, name, role, phone, companyName, contactName, specialties } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      if (!SELF_REGISTER_ROLES.includes(role)) {
        return res.status(400).json({
          error: `Cannot self-register as ${role}. Allowed roles: ${SELF_REGISTER_ROLES.join(', ')}`,
        });
      }

      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }

      const existing = await authQueries.findUserByEmail(normalizedEmail);
      if (existing) {
        return res.status(409).json({ error: 'An account with this email already exists' });
      }

      if (role === 'contractor' && !companyName) {
        return res.status(400).json({ error: 'Company name is required for contractor accounts' });
      }

      const passwordHash = await passwordUtil.hash(password);
      const user = await authQueries.createUser({
        email: normalizedEmail,
        passwordHash,
        name,
        role,
        phone,
      });

      // Create role-specific profile
      if (role === 'contractor') {
        await authQueries.createContractorProfile(user.id, {
          companyName,
          contactName: contactName || name,
          specialties: specialties || [],
        });
      }

      // Auto-login after registration
      const accessToken = jwtUtil.signAccessToken({ userId: user.id, role: user.role });
      const refreshToken = jwtUtil.generateRefreshToken();
      const refreshHash = jwtUtil.hashRefreshToken(refreshToken);

      const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      await authQueries.saveRefreshToken(user.id, refreshHash, expiresAt);

      res.status(201).json({
        token: accessToken,
        refreshToken,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          roleKey: roleKeyMap[user.role] || user.role,
        },
      });
    } catch (err) {
      next(err);
    }
  }
);

// POST /api/auth/login
router.post('/login', requireFields(['email', 'password']), validateEmail, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authQueries.findUserByEmail(email.toLowerCase().trim());

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (!user.is_active) {
      return res.status(403).json({ error: 'Account is deactivated' });
    }

    const valid = await passwordUtil.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate tokens
    const accessToken = jwtUtil.signAccessToken({ userId: user.id, role: user.role });
    const refreshToken = jwtUtil.generateRefreshToken();
    const refreshHash = jwtUtil.hashRefreshToken(refreshToken);

    // Store refresh token (7 day expiry)
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authQueries.saveRefreshToken(user.id, refreshHash, expiresAt);

    res.json({
      token: accessToken,
      refreshToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleKey: roleKeyMap[user.role] || user.role,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/refresh
router.post('/refresh', requireFields(['refreshToken']), async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const tokenHash = jwtUtil.hashRefreshToken(refreshToken);

    const stored = await authQueries.findRefreshToken(tokenHash);
    if (!stored) {
      return res.status(401).json({ error: 'Invalid or expired refresh token' });
    }

    // Delete old token
    await authQueries.deleteRefreshToken(tokenHash);

    // Get user
    const user = await authQueries.findUserById(stored.user_id);
    if (!user || !user.is_active) {
      return res.status(401).json({ error: 'User not found or deactivated' });
    }

    // Issue new tokens
    const newAccessToken = jwtUtil.signAccessToken({ userId: user.id, role: user.role });
    const newRefreshToken = jwtUtil.generateRefreshToken();
    const newRefreshHash = jwtUtil.hashRefreshToken(newRefreshToken);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authQueries.saveRefreshToken(user.id, newRefreshHash, expiresAt);

    res.json({ token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/logout
router.post('/logout', authenticate, async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) {
      const tokenHash = jwtUtil.hashRefreshToken(refreshToken);
      await authQueries.deleteRefreshToken(tokenHash);
    }
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
});

// GET /api/auth/me
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const user = await authQueries.findUserById(req.user.userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const response = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      roleKey: roleKeyMap[user.role] || user.role,
      phone: user.phone,
    };

    // Attach role-specific profile
    if (user.role === 'contractor') {
      response.profile = await authQueries.getContractorProfile(user.id);
    } else if (user.role === 'sales_rep') {
      response.profile = await authQueries.getSalesRepProfile(user.id);
    } else if (user.role === 'inspector') {
      response.profile = await authQueries.getInspectorProfile(user.id);
    }

    res.json(response);
  } catch (err) {
    next(err);
  }
});

// PUT /api/auth/me — update own profile
router.put('/me', authenticate, async (req, res, next) => {
  try {
    const { name, phone, companyName } = req.body;

    if (!name && !phone && !companyName) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    const updated = await authQueries.updateUserProfile(req.user.userId, { name, phone });
    if (!updated) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Update contractor company name if provided
    if (companyName && updated.role === 'contractor') {
      await authQueries.updateContractorCompanyName(req.user.userId, companyName);
    }

    res.json({
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      roleKey: roleKeyMap[updated.role] || updated.role,
      phone: updated.phone,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/change-password
router.post('/change-password', authenticate, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    const storedHash = await authQueries.getUserPasswordHash(req.user.userId);
    if (!storedHash) {
      return res.status(404).json({ error: 'User not found' });
    }

    const valid = await passwordUtil.compare(currentPassword, storedHash);
    if (!valid) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const newHash = await passwordUtil.hash(newPassword);
    await authQueries.updatePassword(req.user.userId, newHash);

    // Invalidate all refresh tokens so other sessions must re-login
    await authQueries.deleteAllUserRefreshTokens(req.user.userId);

    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
