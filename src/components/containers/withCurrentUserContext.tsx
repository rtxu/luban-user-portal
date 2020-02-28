import React from "react";
import { Spin } from "antd";
import Redirect from "umi/redirect";

import useSWRCurrentUser, {
  currentUserInitialValue,
  CurrentUserData
} from "../../hooks/useSWRCurrentUser";
import ServerError from "../ServerError";
import { LS } from "../../util";

export interface CurrentUserContextValue {
  data: CurrentUserData;
}

const defaultContextValue: CurrentUserContextValue = {
  data: currentUserInitialValue
};
export const CurrentUserContext = React.createContext(defaultContextValue);
CurrentUserContext.displayName = "CurrentUserContext";

export default function withCurrentUserContext(WrappedComponent) {
  return props => {
    const { data: currentUser, error } = useSWRCurrentUser();

    // 由于 /currentUser 是非常基础 & 关键的 API，所有已登录用户均需访问
    // 固将 error handle 逻辑提升至此
    // 这样，context user 仅需处理 api 访问正常时的逻辑
    if (error) {
      if (
        error.response.status === 401 ||
        error.response.statusText === "Unauthorized"
      ) {
        // TODO(ruitao.xu): low priority
        // 当前方案存在的问题，考虑如下场景
        // 用户每天访问，结果第 8 天访问时被要求重新登录
        localStorage.removeItem(LS.ACCESS_TOKEN);
        const errMsg = "登录会话已过期，请重新登录";
        let currentLocation: string = props.match ? props.match.url : "/";
        return (
          <Redirect
            to={{
              pathname: "/login",
              state: {
                // used by /login
                loginError: errMsg,
                redirect: currentLocation
              }
            }}
          />
        );
      } else {
        return <ServerError error={error} />;
      }
    }
    if (!currentUser) {
      return (
        <div className="w-screen h-screen flex justify-center items-center bg-gray-200">
          <Spin size="large" />
        </div>
      );
    }
    const ctxValue = { data: currentUser };
    return (
      <CurrentUserContext.Provider value={ctxValue}>
        <WrappedComponent {...props} />
      </CurrentUserContext.Provider>
    );
  };
}
