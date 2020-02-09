import React from "react";

export const CurrentUserContext = React.createContext([
  {
    username: "",
    avatarUrl: ""
  },
  {}
]);
CurrentUserContext.displayName = "CurrentUserContext";

export default function withCurrentUserContext(WrappedComponent) {
  // TOOD(ruitao.xu): load real data
  const ctxValue = {
    username: "guest",
    avatarUrl: "https://avatars0.githubusercontent.com/u/539937?v=4"
  };
  return props => {
    return (
      <CurrentUserContext.Provider value={ctxValue}>
        <WrappedComponent {...props} />
      </CurrentUserContext.Provider>
    );
  };
}
