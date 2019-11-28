import { useEffect } from "react";

import * as demoApp from "./demoApp";

export default (appName, dispatch) => {
  useEffect(() => {
    console.log(`app initializing: ${appName}`);
    if (appName === "demo") {
      demoApp.setUp(dispatch);
    }

    return function cleanup() {
      console.log(`app un-initializing: ${appName}`);
      if (appName === "demo") {
        demoApp.cleanUp(dispatch);
      }
    };
  }, [appName, dispatch]);
};
