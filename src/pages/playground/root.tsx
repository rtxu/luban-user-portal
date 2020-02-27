import React from "react";
import { Switch, Route } from "react-router";

function Page({ match }) {
  // 经测试，如果采用约定式路由，umi 不支持人工编辑路由
  return (
    <Switch>
      <Route path={match.url + "/app/:name+"}>
        <p>App route: {match.url}</p>
      </Route>
      <Route>
        <p>Default route: {match.url}</p>
      </Route>
    </Switch>
  );
}

export default Page;
