enum ServerErrCode {
  JsonDecode = 100,
  BadRequest = 101,
  InvalidParam = 102,
  EntryNotFound = 103,

  EntryAlreadyExist = 200,
  DirNotEmpty = 201
}

export default ServerErrCode;
