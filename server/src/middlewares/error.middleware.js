import fs from 'fs';
import path from 'path';

const isDev = process.env.NODE_ENV !== 'production';

// ── Log directory ──────────────────────────────────────────────────────────────
const LOG_DIR = path.resolve('logs');
if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });

function writeLog(level, entry) {
  const date = new Date().toISOString().slice(0, 10);
  const file = path.join(LOG_DIR, `${level}-${date}.log`);
  const line = JSON.stringify(entry) + '\n';
  fs.appendFileSync(file, line);
}

// ── Error classifier ───────────────────────────────────────────────────────────
function classifyError(err) {
  const code = err.code || '';
  const errno = err.errno || 0;
  const msg = err.message || '';

  // MySQL / DB connection
  if (code === 'ECONNREFUSED' || errno === -4078)
    return { type: 'DB_CONNECTION', status: 503, friendly: 'Cannot connect to the database. Is MySQL running?' };

  if (code === 'ER_ACCESS_DENIED_ERROR')
    return { type: 'DB_AUTH', status: 503, friendly: 'Database credentials are wrong (check DB_USER / DB_PASS in .env).' };

  if (code === 'ER_BAD_DB_ERROR')
    return { type: 'DB_NOT_FOUND', status: 503, friendly: `Database does not exist: ${err.sqlMessage}` };

  // SQL syntax / query errors
  if (code === 'ER_PARSE_ERROR' || code === 'ER_SYNTAX_ERROR')
    return { type: 'SQL_SYNTAX', status: 500, friendly: `SQL syntax error: ${err.sqlMessage}` };

  if (code === 'ER_NO_SUCH_TABLE')
    return { type: 'SQL_NO_TABLE', status: 500, friendly: `Table does not exist: ${err.sqlMessage}` };

  if (code === 'ER_DUP_ENTRY')
    return { type: 'SQL_DUPLICATE', status: 409, friendly: `Duplicate entry: ${err.sqlMessage}` };

  if (code === 'ER_BAD_FIELD_ERROR')
    return { type: 'SQL_BAD_FIELD', status: 500, friendly: `Unknown column in query: ${err.sqlMessage}` };

  if (code && code.startsWith('ER_'))
    return { type: 'SQL_GENERIC', status: 500, friendly: `Database error [${code}]: ${err.sqlMessage || msg}` };

  // JWT
  if (msg.includes('jwt') || msg.includes('JsonWebToken') || msg.includes('invalid signature'))
    return { type: 'JWT_INVALID', status: 401, friendly: 'Token is invalid or has expired.' };

  // Validation (manual throws)
  if (err.status === 400 || err.type === 'VALIDATION')
    return { type: 'VALIDATION', status: 400, friendly: msg };

  // Not found
  if (err.status === 404)
    return { type: 'NOT_FOUND', status: 404, friendly: msg || 'Resource not found.' };

  // Forbidden
  if (err.status === 403)
    return { type: 'FORBIDDEN', status: 403, friendly: msg || 'Access denied.' };

  // Generic
  return { type: 'INTERNAL', status: err.status || 500, friendly: isDev ? msg : 'Internal server error.' };
}

// ── Main error handler ─────────────────────────────────────────────────────────
// Must have 4 params so Express recognises it as an error handler
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  const { type, status, friendly } = classifyError(err);

  const entry = {
    timestamp: new Date().toISOString(),
    type,
    status,
    method: req.method,
    url: req.originalUrl,
    message: err.message,
    ...(isDev && {
      stack: err.stack,
      sql: err.sql,
      sqlMessage: err.sqlMessage,
    }),
  };

  // Always write to file
  writeLog(status >= 500 ? 'error' : 'warn', entry);

  // Dev: pretty-print to console with colour
  if (isDev) {
    const colour = status >= 500 ? '\x1b[31m' : '\x1b[33m'; // red / yellow
    console.error(`\n${colour}[${type}]\x1b[0m ${req.method} ${req.originalUrl}`);
    console.error(`  → ${friendly}`);
    if (err.sql) console.error(`  SQL: ${err.sql}`);
    if (err.stack) console.error(err.stack.split('\n').slice(0, 4).join('\n'));
    console.error('');
  }

  // Response
  res.status(status).json({
    error: {
      type,
      message: friendly,
      ...(isDev && {
        stack: err.stack,
        sql: err.sql,
      }),
    },
  });
}

// ── 404 handler (put before errorHandler in app.js) ───────────────────────────
export function notFoundHandler(req, res, next) {
  const err = new Error(`Route not found: ${req.method} ${req.originalUrl}`);
  err.status = 404;
  next(err);
}