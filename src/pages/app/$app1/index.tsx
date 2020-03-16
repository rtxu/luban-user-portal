import React, { useContext } from "react";

// styles
// @ts-ignore
import styles from "./index.less";

// components
import UserPortalLayout from "@/layouts/UserPortalLayout";
import UserAppMenu from "@/components/UserAppMenu";
import AppLoader, { LoadType } from "@/components/containers/AppLoader";
import AppView from "@/components/AppView";
import NotFoundApp from "@/components/NotFoundApp";

// logic
import { AppMeta, EmptyAppMeta } from "@/types/app";
import { findApp, CurrentUserData } from "@/hooks/useSWRCurrentUser";
import withCurrentUserContext, {
  CurrentUserContext
} from "@/components/containers/withCurrentUserContext";

export function buildAppMeta(
  match: any,
  currentUser: CurrentUserData
): AppMeta {
  let appMeta: AppMeta = Object.assign({}, EmptyAppMeta);
  const { app1, app2, app3 } = match.params;
  for (const name of [app1, app2, app3]) {
    if (name) {
      appMeta.fullName += "/" + name;
      appMeta.name = name;
    }
  }
  appMeta.dirName = appMeta.fullName.slice(
    0,
    appMeta.fullName.length - appMeta.name.length
  );
  const app = findApp(appMeta.fullName, currentUser.rootDir);
  if (app) {
    appMeta.id = app.appId;
  }

  return appMeta;
}

function Page({ match }) {
  const { data: currentUser } = useContext(CurrentUserContext);
  const appMeta = buildAppMeta(match, currentUser);
  if (appMeta.id !== -1) {
    return (
      <UserPortalLayout sider={<UserAppMenu selectedAppId={`${appMeta.id}`} />}>
        <AppLoader appMeta={appMeta} loadType={LoadType.View}>
          <AppView />
        </AppLoader>
      </UserPortalLayout>
    );
  } else {
    return (
      <UserPortalLayout sider={<UserAppMenu />}>
        <NotFoundApp />
      </UserPortalLayout>
    );
  }
}

export default withCurrentUserContext(Page);
