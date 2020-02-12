import { Icon, Layout, Avatar, Menu, Dropdown, Button, Result } from "antd";
import Link from "umi/link";

import { CurrentUserContext } from "../components/containers/withCurrentUserContext";
import { useContext } from "react";
import SiderLogo from "../components/SiderLogo";
import { ReactComponent as EmptySvg } from "../assets/undraw_no_data_qbuo.svg";
import { AppContext } from "../components/containers/withAppContext";

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

function renderDir(dir, prefix, targetAppId) {
  {
    /*
    NEEDHELP(ruitao.xu): 为了实现 icon 与文字在垂直方向的对齐，为什么这里要设置 vertialAlign 为 0，
      而 antd 的[官方文档](https://ant.design/components/menu-cn/)中的 demo 无需设置？
    */
  }
  const MenuIcon = props => <Icon {...props} style={{ verticalAlign: 0 }} />;
  let foundAppId;
  let foundAppKey;
  let foundAppOpenDirs = [];
  const menuItems = dir.map((entry, index) => {
    if (entry.type === "app") {
      const myKey = `${prefix}${entry.appId}`;
      if (!targetAppId) {
        // find the first app
        if (!foundAppId) {
          foundAppId = entry.appId;
          foundAppKey = myKey;
        }
      } else if (targetAppId === `${entry.appId}`) {
        foundAppId = entry.appId;
        foundAppKey = myKey;
      }
      return (
        <Menu.Item key={myKey}>
          <Link to={`/app/${entry.appId}`}>
            <MenuIcon type="mail" />
            {entry.name}
          </Link>
        </Menu.Item>
      );
    } else {
      const myPrefix = `${prefix}${entry.name}_${index}/`;
      const [
        subMenuItems,
        subFoundAppId,
        subFoundAppKey,
        subFoundAppOpenDirs
      ] = renderDir(entry.children, myPrefix, targetAppId);
      if (!foundAppKey && subFoundAppKey) {
        foundAppId = subFoundAppId;
        foundAppKey = subFoundAppKey;
        foundAppOpenDirs = foundAppOpenDirs.concat(
          myPrefix,
          ...subFoundAppOpenDirs
        );
      }
      return (
        <Menu.SubMenu
          key={myPrefix}
          title={
            <span>
              <MenuIcon type="mail" />
              <span>{entry.name}</span>
            </span>
          }
        >
          {subMenuItems}
        </Menu.SubMenu>
      );
    }
  });

  return [menuItems, foundAppId, foundAppKey, foundAppOpenDirs];
}

function AppMenu() {
  const [{ rootDir }] = useContext(CurrentUserContext);

  /*
  const rootDir = [
    {
      name: "分析",
      type: "app",
      appId: 1
    },
    {
      name: "app#2",
      type: "app",
      appId: 2
    },
    {
      name: "app#3",
      type: "app",
      appId: 3
    },
    {
      name: "dir#1",
      type: "directory",
      children: [
        {
          name: "dir#1",
          type: "directory",
          children: [
            {
              name: "app#2",
              type: "app",
              appId: 22
            },
            {
              name: "app#3",
              type: "app",
              appId: 33
            }
          ]
        },
        {
          name: "app#2",
          type: "app",
          appId: 12
        },
        {
          name: "app#3",
          type: "app",
          appId: 13
        }
      ]
    }
  ];
  */

  // 如果 expectedAppId 为 null，说明当前不在 /app/$app 路径下，此时选中第一个 app
  const [{ appId: expectedAppId }] = useContext(AppContext);

  if (rootDir && rootDir.length > 0) {
    const [menuItems, foundAppId, foundAppKey, foundAppOpenDirs] = renderDir(
      rootDir,
      "/",
      expectedAppId
    );
    return (
      <Menu
        theme="dark"
        mode="inline"
        defaultSelectedKeys={[foundAppKey]}
        defaultOpenKeys={foundAppOpenDirs}
      >
        {menuItems}
      </Menu>
    );
  } else {
    return <EmptyAppMenu />;
  }
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
