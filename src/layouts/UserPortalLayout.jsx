import { Layout, Avatar, Menu, Dropdown, Button } from "antd";
import Link from "umi/link";

import { CurrentUserContext } from "../components/containers/withCurrentUserContext";
import { useContext } from "react";
import SiderLogo from "../components/SiderLogo";

function UserSessionNavbar() {
  const [{ avatarUrl }] = useContext(CurrentUserContext);
  const MyMenuItem = ({ children }) => {
    return (
      <Menu.Item>
        <div className="flex items-center justify-center">{children}</div>
      </Menu.Item>
    );
  };
  const avatarMenu = (
    <Menu style={{ width: 100 }}>
      <MyMenuItem>
        <Link to="/logout">退出</Link>
      </MyMenuItem>
    </Menu>
  );
  return (
    <div className="h-full w-full flex justify-end items-center">
      <div className="px-2">
        <Link to="/manage">
          <Button type="primary" icon="edit">
            管理
          </Button>
        </Link>
      </div>
      <div className="px-2">
        <Dropdown overlay={avatarMenu} placement="bottomRight">
          <Avatar src={avatarUrl} />
        </Dropdown>
      </div>
    </div>
  );
}

const UserPortalLayout = ({ sider, children }) => {
  const { Header, Sider, Content } = Layout;
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={256}>
        <SiderLogo />
        {sider}
      </Sider>
      <Layout>
        <Header className="shadow" style={{ backgroundColor: "#fff" }}>
          <UserSessionNavbar />
        </Header>
        <Content style={{ backgroundColor: "#fff", margin: "16px" }}>
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

// UserPortalLayout 是一个 View 组件，用以描述整个 UserPortal 的 Layout
export default UserPortalLayout;
