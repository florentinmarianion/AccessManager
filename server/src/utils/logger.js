import { v4 as uuidv4 } from 'uuid';

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3
};

const LOG_LEVEL = process.env.LOG_LEVEL || 'INFO';

export class Logger {
  constructor(service = 'app') {
    this.service = service;
  }

  log(level, message, data = {}) {
    if (LOG_LEVELS[level] < LOG_LEVELS[LOG_LEVEL]) return;

    const timestamp = new Date().toISOString();
    const correlationId = data.correlationId || 'N/A';
    
    const logEntry = {
      timestamp,
      level,
      service: this.service,
      correlationId,
      message,
      ...(data && Object.keys(data).length > 0 && { data })
    };

    console.log(JSON.stringify(logEntry));
  }

  debug(message, data) { this.log('DEBUG', message, data); }
  info(message, data) { this.log('INFO', message, data); }
  warn(message, data) { this.log('WARN', message, data); }
  error(message, data) { this.log('ERROR', message, data); }
}

export function generateCorrelationId() {
  return uuidv4();
}
