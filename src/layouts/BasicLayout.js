// 注意这里我们除了从antd中引入了Layout布局组件，还引入了Menu菜单组件，Icon图标组件

import { Component } from "react";
import { Layout, Menu } from "antd";
import Link from "umi/link";

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
          <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
            <Menu.Item key="1">
              <Link to="/">
                <span className={styles.menuItem}>应用</span>
              </Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/settings">
                <span className={styles.menuItem}>设置</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ backgroundColor: "#fff" }}>
          {this.props.children}
        </Layout>
      </Layout>
    );
  }
}
