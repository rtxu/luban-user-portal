import useSWR from "swr";

import { SWRKey, lubanApiRequest } from "./common";
import { AppState } from "@/types/app";
import { LoadType } from "@/components/containers/AppLoader";
import { makeQueryString } from "@/util";

function useSWRCurrentUserApp(appId: number, loadType: LoadType) {
  const params = { appId, loadType };
  return useSWR<AppState>(
    SWRKey.CURRENT_USER_APP + "?" + makeQueryString(params),
    lubanApiRequest,
    {}
  );
}

export default useSWRCurrentUserApp;
