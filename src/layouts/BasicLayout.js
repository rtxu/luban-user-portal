import { Component } from "react";
import { Layout } from "antd";

import styles from "./BasicLayout.less";
import { ReactComponent as Logo } from "./logo.svg";

const { Sider } = Layout;

export default class BasicLayout extends Component {
  render() {
    return (
      <Layout>
        <Sider width={256} style={{ minHeight: "100vh" }}>
          <div className={styles.logo}>
            <Logo viewBox="40 115 220 70" />
          </div>
          {/** 搜索框 */}
          <div
            style={{
              height: "32px",
              background: "rgba(255,255,255,.2)",
              margin: "16px"
            }}
          />
          {this.props.menu}
        </Sider>
        <Layout>{this.props.children}</Layout>
      </Layout>
    );
  }
}
