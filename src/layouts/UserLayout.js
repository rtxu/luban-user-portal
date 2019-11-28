import { Menu } from "antd";
import Link from "umi/link";
import { useLocation } from "react-use";

import BasicLayout from "./BasicLayout";
import styles from "./BasicLayout.less";
import useApps from "../hooks/useApps";

const MyLayout = ({ children }) => {
  const [apps] = useApps();
  const { pathname } = useLocation();
  const MyMenu = () => (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={[pathname]}>
      {Object.keys(apps).map(appName => (
        <Menu.Item key={`/app/${encodeURIComponent(appName)}`}>
          <Link to={`/app/${encodeURIComponent(appName)}`}>
            <span className={styles.menuItem}>{appName}</span>
          </Link>
        </Menu.Item>
      ))}
    </Menu>
  );
  return <BasicLayout menu={<MyMenu />}>{children}</BasicLayout>;
};

export default MyLayout;
