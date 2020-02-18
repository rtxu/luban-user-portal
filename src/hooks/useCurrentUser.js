import useSWR from "swr";

import { SWRKey, lubanApiRequest } from "./common";

export const currentUserInitialValue = Object.freeze({
  username: "",
  avatarUrl: "",
  rootDir: []
});

function useCurrentUser() {
  // TODO(ruitao.xu): 考虑异常处理
  const { data: currentUser } = useSWR(SWRKey.CURRENT_USER, lubanApiRequest, {
    initialData: currentUserInitialValue,
    dedupingInterval: 0
  });

  return [currentUser];
}

export default useCurrentUser;
