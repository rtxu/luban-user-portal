import React from "react";
import { useSearchParam } from "react-use";
import Redirect from "umi/redirect";

import { LS } from "../util";

function LoginSuccess() {
  let accessToken = useSearchParam(LS.ACCESS_TOKEN);
  if (accessToken) {
    // login
    localStorage.setItem(LS.ACCESS_TOKEN, accessToken);
  } else {
    accessToken = localStorage.getItem(LS.ACCESS_TOKEN);
  }
  if (accessToken) {
    const redirect = localStorage.getItem(LS.REDIRECT);
    if (redirect) {
      localStorage.removeItem(LS.REDIRECT);
      return <Redirect to={redirect} />;
    } else {
      return <Redirect to="/" />;
    }
  } else {
    // never reach here
    return (
      <div>
        <h1>Login Successfully!</h1>
        <p>AccessToken: {accessToken}</p>
      </div>
    );
  }
}

export default LoginSuccess;
