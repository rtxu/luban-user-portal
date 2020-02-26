import { Icon, Menu, Button } from "antd";
import Link from "umi/link";

import { CurrentUserContext } from "../components/containers/withCurrentUserContext";
import { useContext } from "react";
import { ReactComponent as EmptySvg } from "../assets/undraw_no_data_qbuo.svg";

function EmptyAppMenu() {
  return (
    <div className="mt-40 flex flex-col items-center justify-center">
      <EmptySvg className="w-32 h-32" />
      <p className="mt-2 mb-8 text-white">当前未创建任何应用</p>
      <Link to="/manage">
        <Button type="primary">立即创建</Button>
      </Link>
    </div>
  );
}

function renderDir(dir, prefix, targetAppId) {
  let foundAppKey;
  let foundAppOpenDirs = [];
  const menuItems = dir.map((entry, index) => {
    if (entry.type === "app") {
      const myKey = `${prefix}${entry.appId}`;
      if (!targetAppId) {
        // find the first app
        if (!foundAppKey) {
          foundAppKey = myKey;
        }
      } else if (targetAppId === `${entry.appId}`) {
        foundAppKey = myKey;
      }
      return (
        <Menu.Item key={myKey}>
          <Link to={`/app/${entry.appId}`}>
            <Icon type="mail" />
            {entry.name}
          </Link>
        </Menu.Item>
      );
    } else {
      const myPrefix = `${prefix}${entry.name}_${index}/`;
      const [subMenuItems, subFoundAppKey, subFoundAppOpenDirs] = renderDir(
        entry.children,
        myPrefix,
        targetAppId
      );
      if (!foundAppKey && subFoundAppKey) {
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
              <Icon type="mail" />
              <span>{entry.name}</span>
            </span>
          }
        >
          {subMenuItems}
        </Menu.SubMenu>
      );
    }
  });

  return [menuItems, foundAppKey, foundAppOpenDirs];
}

function UserAppMenu({ selectedAppId }) {
  const {
    data: { rootDir }
  } = useContext(CurrentUserContext);

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

  // 如果 selectedAppId 为 null，默认选中第一个 app
  if (rootDir && rootDir.length > 0) {
    const [menuItems, foundAppKey, foundAppOpenDirs] = renderDir(
      rootDir,
      "/",
      selectedAppId
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

export default UserAppMenu;
