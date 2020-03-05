import React, { useContext } from "react";

// @ts-ignore
import styles from "./index.less";
import withCurrentUserContext, {
  CurrentUserContext
} from "@/components/containers/withCurrentUserContext";
import UserPortalLayout from "@/layouts/UserPortalLayout";
import UserAppMenu from "@/components/UserAppMenu";
import { findApp } from "@/hooks/useSWRCurrentUser";
import AppLoader, { LoadType } from "@/components/AppLoader";
import AppView from "@/components/AppView";
import NotFoundApp from "@/components/NotFoundApp";
import { AppMeta, EmptyAppMeta } from "@/types/app";

function Page({ match }) {
  const { data: currentUser } = useContext(CurrentUserContext);

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
