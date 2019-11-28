import { message } from "antd";
import { useEffect, useCallback } from "react";
import useSWR, { mutate } from "swr";

import * as AppMetaService from "../services/app_meta";

async function fetchApps() {
  let resp;
  let body;
  try {
    resp = await AppMetaService.loadApps();
    body = await resp.json();
  } catch (e) {
    throw new Error(`加载应用异常(${e.name}): ${e.message}`);
  }

  if (body.code === 0) {
    const appList = body.data;
    const appMap = appList.reduce((m, app) => {
      m[app.name] = app;
      return m;
    }, {});
    return appMap;
  } else {
    throw new Error(`加载应用失败(错误码: ${body.code}): ${body.msg}`);
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
  // TODO(ruitao.xu): 考虑异常处理
  const { data: appMap } = useSWR(APPS_KEY, fetchApps, { initialData: {} });
  const deleteApp = useCallback(
    async (appName, handlers = defaultHandlers) => {
      try {
        const resp = await AppMetaService.remove(appName);
        const body = await resp.json();
        if (body.code === 0) {
          const newAppMap = Object.keys(appMap)
            .filter(id => id !== appName)
            .reduce((newApps, id) => {
              newApps[id] = appMap[id];
              return newApps;
            }, {});
          mutate(APPS_KEY, newAppMap, NO_REFETCH);
        } else {
          handlers.onError(`删除应用失败(错误码: ${body.code}): ${body.msg}`);
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
        const resp = await AppMetaService.add(payload);
        const body = await resp.json();
        if (body.code === 0) {
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
          handlers.onError(`应用创建失败(错误码: ${body.code}): ${body.msg}`);
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
        const resp = await AppMetaService.setAppDescription(name, description);
        const body = await resp.json();
        if (body.code === 0) {
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
            `更新应用描述失败(错误码: ${body.code}): ${body.msg}`
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
