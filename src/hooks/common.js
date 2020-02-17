import request from "../util/request";

export const SWRConst = Object.freeze({
  REFETCH: true,
  NO_REFETCH: false
});

export const SWRKey = Object.freeze({
  CURRENT_USER: "/currentUser"
});

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
    if (!url.startsWith(API_ENDPOINT)) {
      url = API_ENDPOINT + url;
    }
  }
  if (typeof args[1] === "object") {
    options = args[1];
  }

  options = Object.assign(defaultOptions, options);

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
  return lbExtractServerData ? extractServerData(json) : json;
}
