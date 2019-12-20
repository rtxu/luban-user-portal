import { Icon, Typography, Button } from "antd";

import styles from "./login.less";

const { Title, Paragraph } = Typography;

function onClickGitHubLogin(event) {
  const params = {
    client_id: "1421764d694281e03269",
    scope: "user:read",
    redirect_uri: "http://localhost:8000/auth/github-callback"
  };
  const query = Object.keys(params)
    .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(params[k]))
    .join("&");
  window.location = `https://github.com/login/oauth/authorize?${query}`;
}

function Login({}) {
  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.title}>
          <Title level={1}>登录</Title>
        </div>
        <div className={styles.actionContainer}>
          <button role="button" type="text" onClick={onClickGitHubLogin}>
            <Icon
              type="github"
              className={styles.icon}
              style={{ fontSize: "20px" }}
            />
            <span>GitHub</span>
          </button>
        </div>
      </div>
      <div className={styles.signup}>
        <a href="/auth/signup">
          <p>还没有账号？点击注册</p>
        </a>
      </div>
    </div>
  );
}

export default Login;
