import { Menu } from "antd";
import { connect } from "dva";
import Link from "umi/link";

import BasicLayout from "./BasicLayout";
import styles from "./BasicLayout.less";

const MyMenu = ({ apps }) => {
  return (
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
  );
};

const MyLayout = ({ children, apps }) => {
  return <BasicLayout menu={<MyMenu apps={apps} />}>{children}</BasicLayout>;
};

const mapStateToProps = state => {
  return {
    apps: state.apps
  };
};
export default connect(mapStateToProps)(MyLayout);
