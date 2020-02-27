import React from "react";

import useSWRCurrentUser, {
  currentUserInitialValue,
  CurrentUserData
} from "../../hooks/useSWRCurrentUser";
import { responseInterface } from "swr";

const defaultContextValue: responseInterface<CurrentUserData, any> = {
  data: currentUserInitialValue,
  error: null,
  revalidate: () => new Promise<boolean>(resolve => resolve(true)),
  isValidating: false
};
export const CurrentUserContext = React.createContext(defaultContextValue);
CurrentUserContext.displayName = "CurrentUserContext";

export default function withCurrentUserContext(WrappedComponent) {
  return props => {
    const ctxValue = useSWRCurrentUser();
    return (
      <CurrentUserContext.Provider value={ctxValue}>
        <WrappedComponent {...props} />
      </CurrentUserContext.Provider>
    );
  };
}
