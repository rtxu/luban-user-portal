import debug from 'debug';

export function assert(condition, message) {
  if (!condition) {
      message = message || "Assertion failed";
      if (typeof Error !== "undefined") {
          throw new Error(message);
      }
      throw message; // Fallback
  }
}

function beginMock(req) {
  console.log('==== begin mock ====');
  console.log(`METHOD: ${req.method}`);
  console.log(`URL   : ${req.originalUrl}`);
}

function endMock() {
  console.log('====  end mock ====');
}

export function createMockHandler(handler) {
  return (req, res) => {
    beginMock(req);
    handler(req ,res);
    endMock();
  }
}

// ref: https://github.com/visionmedia/debug
const rootLogger = debug('luban');
export function createLogger(loggerName) {
  const baseLogger = rootLogger.extend(loggerName);
  return {
    trace: baseLogger.extend('trace'),
    debug: baseLogger.extend('debug'),
    info: baseLogger.extend('info'),
    warn: baseLogger.extend('warn'),
    // TODO(ruitao.xu): when fatal log, throw exception
    fatal: baseLogger.extend('fatal'),
  }
}