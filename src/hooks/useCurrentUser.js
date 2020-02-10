import useSWR from "swr";

import request from "../util/request";

async function fetch() {
  let result;
  try {
    result = await request(API_ENDPOINT + "/currentUser", {
      headers: {
        Authorization: localStorage.getItem("access_token")
      }
    });
  } catch (e) {
    throw new Error(`获取当前用户信息异常(${e.name}): ${e.message}`);
  }

  if (result.code === 0) {
    return result.data;
  } else {
    throw new Error(
      `获取当前用户信息失败(错误码: ${result.code}): ${result.msg}`
    );
  }
}

const CURRENT_USER_KEY = "/currentUser";
const REFETCH = true;
const NO_REFETCH = false;
function useCurrentUser() {
  // TODO(ruitao.xu): 考虑异常处理
  const { data: currentUser } = useSWR(CURRENT_USER_KEY, fetch, {
    initialData: {}
  });

  return [currentUser];
}

export default useCurrentUser;
