const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { config } = require('./config');
const { apiLimiter } = require('./middleware/rateLimit');
const hotelsRouter = require('./routes/hotels');
const authRouter = require('./routes/auth');
const accessRequestsRouter = require('./routes/accessRequests');
const usersRouter = require('./routes/users');
const editRequestsRouter = require('./routes/editRequests');

const app = express();

// Rate limiting keys off req.ip, which is the proxy's address unless Express
// is told how many hops to trust. Left at 0 (trust nothing) by default.
app.set('trust proxy', config.trustProxy);
app.disable('x-powered-by');

app.use(helmet({
  // The API returns JSON to a frontend on a different origin; the default
  // same-origin resource policy would block those reads in some browsers.
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  // No HTML is served from here, so a CSP would only constrain error pages.
  contentSecurityPolicy: false,
}));

// In development any localhost/127.0.0.1 origin is accepted regardless of port,
// so changing the static server's port never silently breaks the frontend.
// Production ignores this entirely and honours only the explicit allowlist.
const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/;

function isAllowedOrigin(origin) {
  if (config.corsOrigins.includes(origin)) return true;
  if (!config.isProduction && LOCALHOST_ORIGIN.test(origin)) return true;
  return false;
}

// An empty allowlist means "reflect any origin" — only reachable in dev, since
// validateConfig() makes an unset CORS_ORIGINS fatal under NODE_ENV=production.
const corsOptions = config.corsOrigins.length === 0
  ? {}
  : {
    origin(origin, callback) {
      // No Origin header: same-origin, curl, or a server-to-server call.
      if (!origin || isAllowedOrigin(origin)) return callback(null, true);
      callback(new Error('Origin not allowed by CORS.'));
    },
    credentials: true,
  };

app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api', apiLimiter);
app.use('/api/auth', authRouter);
app.use('/api/hotels', hotelsRouter);
app.use('/api/access-requests', accessRequestsRouter);
app.use('/api/users', usersRouter);
app.use('/api/edit-requests', editRequestsRouter);

app.use((req, res) => {
  res.status(404).json({ error: 'Not found.' });
});

// Central error handler — keep raw error details out of the response.
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.message === 'Origin not allowed by CORS.') {
    return res.status(403).json({ error: 'Origin not allowed.' });
  }
  console.error(err);
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Malformed JSON body.' });
  }
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ error: 'Payload too large.' });
  }
  res.status(500).json({ error: 'Internal server error.' });
});

module.exports = app;
