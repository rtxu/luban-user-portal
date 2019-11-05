import { Action, createAction, handleActions } from 'redux-actions';
import * as AppMetaService from '../services/app_meta';
import { message } from 'antd';

// Actions
const NS = 'apps';
const addAppSuccessType = 'APP_ADD_SUCCESS';
const addAppSuccessLocal = createAction(addAppSuccessType);
const deleteAppSuccessType = `APP_DELETE_SUCCESS`;
const deleteAppSuccessLocal = createAction(deleteAppSuccessType);
const setAppDescriptionSuccessType = `APP_DESCRIPTION_SET_SUCCESS`;
const setAppDescriptionSuccessLocal = createAction(setAppDescriptionSuccessType);
const initAppsType = 'APPS_INIT';
const initAppsLocal = createAction(initAppsType);

// Effects
const addAppType = `APP_ADD`;
const addAppTypeNs = `${NS}/${addAppType}`;
export const addApp = createAction(addAppTypeNs);
const deleteAppType = `APP_DELETE`;
const deleteAppTypeNs = `${NS}/${deleteAppType}`;
export const deleteApp = createAction(deleteAppTypeNs);
const setAppDescriptionType = `APP_DESCRIPTION_SET`;
const setAppDescriptionTypeNs = `${NS}/${setAppDescriptionType}`;
export const setAppDescription = createAction(setAppDescriptionTypeNs);
const loadAppsType = `APPS_LOAD`;
const loadAppsTypeNs = `${NS}/${loadAppsType}`;
export const loadApps = createAction(loadAppsTypeNs);

// initial state
export const initialState = {};
// schema
const appInitialState = {
  // TODO(ruitao.xu): session-level data
  organization: '该 app 所属的组织，该数据应该来自 session(current_user, current_org)',
  name: 'sample app',
  description: 'sample app description',
}

// Reducers
export default {
  state: initialState,
  effects: {
    *[addAppType](action, sagaEffects) {
      const { call, put } = sagaEffects;
      try {
        const resp = yield call(AppMetaService.add, action.payload);
        const body = yield resp.json();
        if (body.code === 0) {
          yield put(addAppSuccessLocal(action.payload));
          message.success('应用创建成功');
        } else {
          message.error(`应用创建失败(错误码: ${body.code}): ${body.msg}`);
        }
      } catch(e) {
        message.error(`应用创建异常(${e.name}): ${e.message}`);
      }
    },
    *[loadAppsType](action, sagaEffects) {
      const { call, put } = sagaEffects;
      try {
        const resp = yield call(AppMetaService.loadApps);
        const body = yield resp.json();
        if (body.code === 0) {
          const appList = body.data;
          const appMap = appList.reduce((m, app) => {
            m[app.name] = app;
            return m;
          }, {})
          yield put(initAppsLocal(appMap));
        } else {
          message.error(`加载应用失败(错误码: ${body.code}): ${body.msg}`);
        }
      } catch(e) {
        message.error(`加载应用异常(${e.name}): ${e.message}`);
      }
    },
    *[deleteAppType](action, sagaEffects) {
      const { call, put } = sagaEffects;
      const appName = action.payload;
      try {
        const resp = yield call(AppMetaService.remove, appName);
        const body = yield resp.json();
        if (body.code === 0) {
          yield put(deleteAppSuccessLocal(appName));
          message.success(`应用「${appName}」已删除`);
        } else {
          message.error(`删除应用失败(错误码: ${body.code}): ${body.msg}`);
        }
      } catch(e) {
        message.error(`删除应用异常(${e.name}): ${e.message}`);
      }
    },
    *[setAppDescriptionType](action, sagaEffects) {
      const { call, put } = sagaEffects;
      const { name, description } = action.payload;
      try {
        const resp = yield call(AppMetaService.setAppDescription, name, description);
        const body = yield resp.json();
        if (body.code === 0) {
          yield put(setAppDescriptionSuccessLocal({name, description}));
        } else {
          message.error(`更新应用描述失败(错误码: ${body.code}): ${body.msg}`);
        }
      } catch(e) {
        message.error(`更新应用描述异常(${e.name}): ${e.message}`);
      }
    },
  },
  reducers: {
    [addAppSuccessType]: (state, action) => {
      const { name, description } = action.payload;
      return {
        ...state,
        [name]: {
          ...appInitialState,
          name,
          description,
        }
      }
    },
    [deleteAppSuccessType]: (state, action) => {
      const toDeleteId = action.payload;
      return Object.keys(state).filter((id) => id !== toDeleteId)
        .reduce((newApps, id) => {
          newApps[id] = state[id]
          return newApps
        }, {})
    },
    [initAppsType]: (state, action) => {
      return action.payload;
    },
    [setAppDescriptionSuccessType]: (state, action) => {
      const {name, description} = action.payload;
      return {
        ...state,
        [name]: {
          ...state[name],
          description,
        }
      };
    },
  },
};

// Selectors