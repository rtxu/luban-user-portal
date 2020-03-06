import debug from "debug";

export enum LS {
  ACCESS_TOKEN = "access_token",
  REDIRECT = "redirect"
}

export function assert(condition: boolean, message?: string) {
  if (!condition) {
    message = message || "Assertion failed";
    if (typeof Error !== "undefined") {
      throw new Error(message);
    }
    throw message; // Fallback
  }
}

function beginMock(req) {
  console.log("==== begin mock ====");
  console.log(`METHOD: ${req.method}`);
  console.log(`URL   : ${req.originalUrl}`);
}

function endMock() {
  console.log("====  end mock ====");
}

export function createMockHandler(handler) {
  return (req, res) => {
    beginMock(req);
    handler(req, res);
    endMock();
  };
}

// ref: https://github.com/visionmedia/debug
const rootLogger = debug("luban");
export function createLogger(loggerName) {
  const baseLogger = rootLogger.extend(loggerName);
  return {
    trace: baseLogger.extend("trace"),
    debug: baseLogger.extend("debug"),
    info: baseLogger.extend("info"),
    warn: baseLogger.extend("warn"),
    // BETTER TODO(ruitao.xu): when fatal log, throw exception
    fatal: baseLogger.extend("fatal")
  };
}

export function wrapDispatchToFire(dispatch) {
  const fire = (action, midware) => {
    dispatch(midware ? midware(action) : action);
  };

  return fire;
}

export function makeQueryString(params) {
  return Object.keys(params)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
}
