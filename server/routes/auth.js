const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const JWT_SECRET = process.env.JWT_SECRET;

// Default admin credentials (in production, override via env)
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'klorpe';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '12344321klorpe';

// Hash password on startup
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// Защита от перебора пароля: макс 10 неудачных попыток с одного IP за 15 минут
const MAX_LOGIN_ATTEMPTS = 10;
const LOCKOUT_MINUTES = 15;
const loginAttempts = new Map();

function getClientIP(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
}

function isLoginBlocked(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() > entry.resetAt) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_LOGIN_ATTEMPTS;
}

function recordFailedLogin(ip) {
  const now = Date.now();
  const entry = loginAttempts.get(ip) || { count: 0, resetAt: now + LOCKOUT_MINUTES * 60 * 1000 };
  entry.count++;
  if (now > entry.resetAt) entry.resetAt = now + LOCKOUT_MINUTES * 60 * 1000;
  loginAttempts.set(ip, entry);
}

function clearLoginAttempts(ip) {
  loginAttempts.delete(ip);
}

// Login endpoint
router.post('/login', async (req, res) => {
  const ip = getClientIP(req);

  try {
    if (isLoginBlocked(ip)) {
      return res.status(429).json({
        error: `Слишком много попыток входа. Попробуйте через ${LOCKOUT_MINUTES} минут.`
      });
    }

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    // Check credentials
    if (username !== ADMIN_USERNAME) {
      recordFailedLogin(ip);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValidPassword = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);

    if (!isValidPassword) {
      recordFailedLogin(ip);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    clearLoginAttempts(ip);

    // Generate JWT token
    const token = jwt.sign(
      { username: ADMIN_USERNAME, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        username: ADMIN_USERNAME,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Verify token endpoint
router.get('/verify', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({ valid: true, user: decoded });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
