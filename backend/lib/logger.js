/**
 * Structured JSON logger.
 * Outputs to stdout/stderr in a format compatible with Google Cloud Logging.
 */

export const logger = {
  info(msg, meta = {}) {
    console.log(JSON.stringify({
      severity: 'INFO',
      message: msg,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  },

  warn(msg, meta = {}) {
    console.warn(JSON.stringify({
      severity: 'WARNING',
      message: msg,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  },

  error(msg, err, meta = {}) {
    console.error(JSON.stringify({
      severity: 'ERROR',
      message: msg,
      error: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      ...meta,
      timestamp: new Date().toISOString(),
    }));
  },
};
