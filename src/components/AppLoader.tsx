import React from "react";
import { message, Spin } from "antd";

import { AppMeta } from "@/types/app";
import { AppContextProviderRedux } from "./containers/withAppContext";
import useSWRCurrentUserApp from "@/hooks/useSWRCurrentUserApp";

export enum LoadType {
  View = "view",
  Edit = "edit",
  Preview = "preview"
}

export interface AppLoaderProps {
  loadType: LoadType;
  appMeta: AppMeta;
  children: any;
}
const AppLoader: React.FC<AppLoaderProps> = ({
  loadType,
  appMeta,
  children
}) => {
  // load data
  const { data, error } = useSWRCurrentUserApp(appMeta.id, loadType);

  if (error) {
    message.error("加载数据失败，正在重试，请稍后");
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <Spin size="large" />
      </div>
    );
  }

  console.log(`app(id=${appMeta.id}, loadType=${loadType}): `, data);

  return (
    <AppContextProviderRedux appMeta={appMeta} initialData={data}>
      {children}
    </AppContextProviderRedux>
  );
};

/**
 * 负责加载 app 数据，并处理数据加载中、出错等状态
 * 数据加载成功后，构造 AppContext
 */
export default AppLoader;
