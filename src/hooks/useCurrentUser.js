import useSWR from "swr";

import { SWRKey, lubanApiRequest } from "./common";

function useCurrentUser() {
  // TODO(ruitao.xu): 考虑异常处理
  const { data: currentUser } = useSWR(SWRKey.CURRENT_USER, lubanApiRequest, {
    initialData: {}
  });

  return [currentUser];
}

export default useCurrentUser;
