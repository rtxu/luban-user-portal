import request from "../util/request";

export const SWRConst = Object.freeze({
  REFETCH: true,
  NO_REFETCH: false
});

export enum SWRKey {
  CURRENT_USER = "/currentUser",
  CURRENT_USER_ENTRY = "/currentUser/entry",
  CURRENT_USER_APP = "/currentUser/app"
}

/**
  server data pattern: 
  {
    code: 0,  // 0 means OK, otherwise error happened
    msg: "",  // error msg when error happened
    data: <any>
  }
*/
function extractServerData(json) {
  if (json.code === 0) {
    return json.data;
  }

  throw new Error(
    `server response error data, code: ${json.code}, msg: ${json.msg}`
  );
}

function needExtractServerData(fetchOptions) {
  // 写操作不带回数据，需要调用者自行判断服务端状态码
  if (
    // no 'method' means 'GET'
    !("method" in fetchOptions) ||
    fetchOptions.method in ["POST", "PUT", "DELETE"]
  ) {
    return true;
  }
  return false;
}

// 1. 大多数 GET 请求需要填写 auth header
// 2. 大多数 GET 请求无需处理 json.code !== 0 的情况
const defaultOptions = Object.freeze({
  lbAuth: true,
  lbExtractServerData: true
});
export async function lubanApiRequest(...args) {
  let url, options;

  if (args.length >= 1) {
    url = args[0];
    // @ts-ignore
    if (!url.startsWith(API_ENDPOINT)) {
      // @ts-ignore
      url = API_ENDPOINT + url;
    }
  }
  if (typeof args[1] === "object") {
    options = args[1];
  }

  options = Object.assign({}, defaultOptions, options);

  const { lbAuth, lbExtractServerData, ...fetchOptions } = options;
  let myFetchOptions = Object.assign(fetchOptions);
  if (lbAuth) {
    myFetchOptions.headers = Object.assign(
      {
        Authorization: localStorage.getItem("access_token")
      },
      fetchOptions.headers
    );
  }

  const json = await request(url, myFetchOptions);
  const result =
    needExtractServerData(myFetchOptions) && lbExtractServerData
      ? extractServerData(json)
      : json;

  // console.log(result);

  return result;
}

export function makeJsonBody(payload) {
  return new Blob([JSON.stringify(payload)], { type: "application/json" });
}
