import { Icon, Layout, Avatar, Menu, Dropdown, Button, Result } from "antd";
import Link from "umi/link";

import { CurrentUserContext } from "../components/containers/withCurrentUserContext";
import { useContext } from "react";
import SiderLogo from "../components/SiderLogo";
import { ReactComponent as EmptySvg } from "../assets/undraw_no_data_qbuo.svg";

function UserSessionNavbar() {
  const [currentUser] = useContext(CurrentUserContext);
  const { avatarUrl } = currentUser;
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
        <Button type="primary" icon="edit" href="/manage">
          管理
        </Button>
      </div>
      <div className="px-2">
        <Dropdown overlay={avatarMenu} placement="bottomRight">
          <Avatar src={avatarUrl} />
        </Dropdown>
      </div>
    </div>
  );
}

function EmptyAppMenu() {
  return (
    <div className="mt-40 flex flex-col items-center justify-center">
      <EmptySvg className="w-32 h-32" />
      <p className="mt-2 mb-8 text-white">当前未创建任何应用</p>
      <Button type="primary" href="/manage">
        立即创建
      </Button>
    </div>
  );
}

function AppMenu() {
  const { SubMenu } = Menu;
  const handleClick = e => {
    console.log("click ", e);
  };
  return (
    <Menu
      onClick={handleClick}
      defaultSelectedKeys={["1"]}
      defaultOpenKeys={["sub1"]}
      mode="inline"
      theme="dark"
    >
      <SubMenu
        key="sub1"
        title={
          <span>
            <Icon type="mail" />
            <span>Navigation One</span>
          </span>
        }
      >
        <Menu.ItemGroup key="g1" title="Item 1">
          <Menu.Item key="1">Option 1</Menu.Item>
          <Menu.Item key="2">Option 2</Menu.Item>
        </Menu.ItemGroup>
        <Menu.ItemGroup key="g2" title="Item 2">
          <Menu.Item key="3">Option 3</Menu.Item>
          <Menu.Item key="4">Option 4</Menu.Item>
        </Menu.ItemGroup>
      </SubMenu>
      <SubMenu
        key="sub2"
        title={
          <span>
            <Icon type="appstore" />
            <span>Navigation Two</span>
          </span>
        }
      >
        <Menu.Item key="5">Option 5</Menu.Item>
        <Menu.Item key="6">Option 6</Menu.Item>
        <SubMenu key="sub3" title="Submenu">
          <Menu.Item key="7">Option 7</Menu.Item>
          <Menu.Item key="8">Option 8</Menu.Item>
        </SubMenu>
      </SubMenu>
      <SubMenu
        key="sub4"
        title={
          <span>
            <Icon type="setting" />
            <span>Navigation Three</span>
          </span>
        }
      >
        <Menu.Item key="9">Option 9</Menu.Item>
        <Menu.Item key="10">Option 10</Menu.Item>
        <Menu.Item key="11">Option 11</Menu.Item>
        <Menu.Item key="12">Option 12</Menu.Item>
      </SubMenu>
    </Menu>
  );
}

let UserPortal = ({ children }) => {
  const { Header, Sider, Content } = Layout;
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={256}>
        <SiderLogo />
        <AppMenu />
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
export default UserPortal;
