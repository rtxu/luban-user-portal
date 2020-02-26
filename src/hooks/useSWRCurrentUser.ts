import useSWR from "swr";

import { SWRKey, lubanApiRequest } from "./common";

export interface CurrentUserData {
  username: string;
  avatarUrl: string;
  rootDir: any[];
}

export const currentUserInitialValue: CurrentUserData = Object.freeze({
  username: "",
  avatarUrl: "",
  rootDir: []
});

function useSWRCurrentUser() {
  return useSWR<CurrentUserData>(SWRKey.CURRENT_USER, lubanApiRequest, {
    // initialData: currentUserInitialValue,
    // 0.1.17 版本的 bug：https://github.com/zeit/swr/issues/271
    // fix 后可去除此配置
    dedupingInterval: 0
  });
}

export default useSWRCurrentUser;
