import React from "react";

import useCurrentUser, {
  currentUserInitialValue
} from "../../hooks/useCurrentUser";

export const CurrentUserContext = React.createContext([
  {
    ...currentUserInitialValue
  },
  {}
]);
CurrentUserContext.displayName = "CurrentUserContext";

export default function withCurrentUserContext(WrappedComponent) {
  return props => {
    const [currentUser] = useCurrentUser();
    const ctxValue = [currentUser, {}];
    return (
      <CurrentUserContext.Provider value={ctxValue}>
        <WrappedComponent {...props} />
      </CurrentUserContext.Provider>
    );
  };
}
