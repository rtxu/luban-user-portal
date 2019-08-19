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