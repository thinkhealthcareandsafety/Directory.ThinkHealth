const jwt = require('jsonwebtoken');
const { config } = require('../config');

// requireRole('admin') — verifies the JWT and rejects unless req.user.role
// is in `roles`. Mounted on POST/PUT/DELETE /api/hotels/* per spec section
// 0: those routes may never be open, no exceptions.
function requireRole(...roles) {
  return (req, res, next) => {
    const secret = config.jwtSecret;
    if (!secret) {
      console.error('JWT_SECRET is not set — refusing to serve authenticated request.');
      return res.status(500).json({ error: 'Server auth is not configured.' });
    }

    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');
    if (scheme !== 'Bearer' || !token) {
      return res.status(401).json({ error: 'Unauthorized.' });
    }

    let payload;
    try {
      payload = jwt.verify(token, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token.' });
    }

    if (roles.length > 0 && !roles.includes(payload.role)) {
      return res.status(403).json({ error: 'Forbidden — insufficient role.' });
    }

    req.user = { id: payload.sub, email: payload.email, role: payload.role };
    next();
  };
}

module.exports = { requireRole };
