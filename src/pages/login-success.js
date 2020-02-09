import { useSearchParam } from "react-use";
import router from "umi/router";

function LoginSuccess() {
  let accessToken = useSearchParam("access_token");
  if (accessToken) {
    // login
    localStorage.setItem("access_token", accessToken);
    console.log("save access_token to localStorage");
  } else {
    accessToken = localStorage.getItem("access_token");
    console.log("empty access_token");
  }
  if (accessToken) {
    router.replace("/");
  }

  return (
    <div>
      <h1>Login Successfully!</h1>
      <p>AccessToken: {accessToken}</p>
    </div>
  );
}

export default LoginSuccess;
