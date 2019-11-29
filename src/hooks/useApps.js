import { message } from "antd";
import { useCallback, useEffect } from "react";
import useSWR, { mutate } from "swr";

import * as AppMetaService from "../services/app_meta";

async function fetchApps() {
  let result;
  try {
    result = await AppMetaService.loadApps();
  } catch (e) {
    throw new Error(`加载应用异常(${e.name}): ${e.message}`);
  }

  if (result.code === 0) {
    const appList = result.data;
    const appMap = appList.reduce((m, app) => {
      m[app.name] = app;
      return m;
    }, {});
    return appMap;
  } else {
    throw new Error(`加载应用失败(错误码: ${result.code}): ${result.msg}`);
  }
}

const defaultHandlers = {
  onSuccess: msg => {
    message.success(msg);
  },
  onError: msg => {
    message.error(msg);
  }
};

const APPS_KEY = "/currentUser/apps";
const REFETCH = true;
const NO_REFETCH = false;
function useApps() {
  useEffect(() => {
    AppMetaService.add({
      name: "demo",
      description:
        "用以展示 luban 的基础能力：布局可定制、UI可定制、数据流可定制"
    });
  }, []);
  // TODO(ruitao.xu): 考虑异常处理
  const { data: appMap } = useSWR(APPS_KEY, fetchApps, {
    initialData: {}
  });
  const deleteApp = useCallback(
    async (appName, handlers = defaultHandlers) => {
      try {
        const result = await AppMetaService.remove(appName);
        if (result.code === 0) {
          const newAppMap = Object.keys(appMap)
            .filter(id => id !== appName)
            .reduce((newApps, id) => {
              newApps[id] = appMap[id];
              return newApps;
            }, {});
          mutate(APPS_KEY, newAppMap, NO_REFETCH);
        } else {
          handlers.onError(
            `删除应用失败(错误码: ${result.code}): ${result.msg}`
          );
        }
      } catch (e) {
        handlers.onError(`删除应用异常(${e.name}): ${e.message}`);
      }
    },
    [appMap]
  );
  const addApp = useCallback(
    async (payload, handlers = defaultHandlers) => {
      try {
        const result = await AppMetaService.add(payload);
        if (result.code === 0) {
          const { name } = payload;
          mutate(
            APPS_KEY,
            {
              ...appMap,
              [name]: {
                ...payload
              }
            },
            NO_REFETCH
          );
          handlers.onSuccess("应用创建成功");
        } else {
          handlers.onError(
            `应用创建失败(错误码: ${result.code}): ${result.msg}`
          );
        }
      } catch (e) {
        handlers.onError(`应用创建异常(${e.name}): ${e.message}`);
      }
    },
    [appMap]
  );
  const setAppDescription = useCallback(
    async (name, description, handlers = defaultHandlers) => {
      try {
        const result = await AppMetaService.setAppDescription(
          name,
          description
        );
        if (result.code === 0) {
          mutate(
            APPS_KEY,
            {
              ...appMap,
              [name]: {
                ...appMap[name],
                description
              }
            },
            NO_REFETCH
          );
        } else {
          handlers.onError(
            `更新应用描述失败(错误码: ${result.code}): ${result.msg}`
          );
        }
      } catch (e) {
        handlers.onError(`更新应用描述异常(${e.name}): ${e.message}`);
      }
    },
    [appMap]
  );

  return [appMap, { deleteApp, addApp, setAppDescription }];
}

export default useApps;
