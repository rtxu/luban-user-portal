import React from "react";

export interface AppViewContainerProps {
  appId: number;
}
const AppViewContainer: React.FC<AppViewContainerProps> = ({ appId }) => {
  return <div>This is app view container, appId: {appId}</div>;
};

export default AppViewContainer;
