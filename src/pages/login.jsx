import { Icon, Typography } from "antd";

import styles from "./login.less";
import Navbar from "../components/Navbar";
import { makeQueryString, LS } from "../util";

const { Title } = Typography;

function onClickGitHubLogin(event) {
  const params = {
    // eslint-disable-next-line no-undef
    client_id: GITHUB_OAUTH_APP.client_id,
    scope: "user:read",
    // eslint-disable-next-line no-undef
    redirect_uri: API_ENDPOINT + "/callback/github/login"
  };
  // ref: https://stackoverflow.com/questions/503093/how-do-i-redirect-to-another-webpage
  window.location.href = `https://github.com/login/oauth/authorize?${makeQueryString(
    params
  )}`;
}

function Page({ location }) {
  const { loginError, redirect } = location.state ? location.state : {};
  if (redirect) {
    localStorage.setItem(LS.REDIRECT, redirect);
  }

  return (
    <>
      <Navbar contentClassName="max-w-6xl mx-auto" />
      <div className={styles.container}>
        <div className={styles.main}>
          <div className={styles.title}>
            <Title level={1}>登录</Title>
          </div>
          <div className={styles.actionContainer}>
            <button
              role="button"
              type="text"
              className={styles["login-btn-github"]}
              onClick={onClickGitHubLogin}
            >
              <Icon
                type="github"
                className={styles.icon}
                style={{ fontSize: "20px" }}
              />
              <span>GitHub</span>
            </button>
          </div>
          <div className="my-5 max-w-xl">
            {loginError ? (
              <div className="px-6 py-3 rounded bg-red-600 text-white">
                <span className="font-bold">Error: </span>
                {loginError}
              </div>
            ) : null}
          </div>
        </div>
        <div className={styles.signup}>
          <a href="/signup">
            <p>还没有账号？点击注册</p>
          </a>
        </div>
      </div>
    </>
  );
}

export default Page;
