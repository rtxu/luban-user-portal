import { createAction } from 'redux-actions';

import WidgetFactory from '../../../components/WidgetFactory';
import { createLogger } from '../../../util';
import * as widgetsService from '../services/widgets';
import { setActiveWidgetId } from './editorCtx';

const logger = createLogger('/pages/editor/models/widgets');

interface IWidget {
  /** meta */
  id: string;
  type: string;
  instanceId: number;

  /** layout */
  gridLeft: number;
  gridTop: number;
  gridWidth: number;
  gridHeight: number;

  content: any;
}

type PartialIWidget = Partial<IWidget>;

interface IWdigetMap {
  [id: string]: IWidget;
}

// initial state
export const initialState: IWdigetMap = {};

// Actions
export const NS = 'widgets';
const addOrUpdateWidgetType = `WIDGET_ADD_OR_UPDATE`;
const addOrUpdateWidgetTypeNs = `${NS}/${addOrUpdateWidgetType}`;
export const addOrUpdateWidget = createAction<PartialIWidget>(addOrUpdateWidgetTypeNs);
const deleteWidgetType = `WIDGET_DELETE`;
const deleteWidgetTypeNs = `${NS}/${deleteWidgetType}`;
export const deleteWidget = createAction<{widgetId: string}>(deleteWidgetTypeNs);
const updateWidgetContentType = `WIDGET_CONTENT_UPDATE`;
const updateWidgetContentTypeNs = `${NS}/${updateWidgetContentType}`;
export const updateWidgetContent = createAction<{widgetId: string, widgetAction: any}>(updateWidgetContentTypeNs);
const initWidgetsType = `WIDGETS_INIT`;
const initWidgetsTypeNS = `${NS}/${initWidgetsType}`;
const initWidgetsLocal = createAction<IWdigetMap>(initWidgetsType);
export const initWidgets = createAction<IWdigetMap>(initWidgetsTypeNS);
const changeWidgetIdType = `WIDGET_ID_CHANGE`;
const changeWidgetIdTypeNs = `${NS}/${changeWidgetIdType}`;
export const changeWidgetId = createAction<{oldWidgetId: string, newWidgetId: string}>(changeWidgetIdTypeNs);
const changeWidgetIdLocal = createAction<{oldWidgetId: string, newWidgetId: string}>(changeWidgetIdType);

// Effects
const changeWidgetIdAndSetActiveType = `WIDGET_ID_CHANGE_AND_SET_ACTIVE`;
const changeWidgetIdAndSetActiveTypeNs = `${NS}/${changeWidgetIdAndSetActiveType}`;
export const changeWidgetIdAndSetActive = createAction<{oldWidgetId: string, newWidgetId: string}>(changeWidgetIdAndSetActiveTypeNs);

function removePrefix(str, prefix) {
  if (str.startsWith(prefix)) {
    return str.slice(prefix.length);
  } else {
    return str;
  }
}

// action midware
export function withAfterSave(action) {
  return {
    type: `${NS}/saveWidgets`,
    payload: { 
      ...action,
      type: removePrefix(action.type, `${NS}/`),
    },
  }
}

function _addOrUpdate(widgets, newWidget) {
  if ('id' in newWidget) {
    // update

  } else {
    // add
    let maxInstanceId = 0;
    for (const widgetId of Object.keys(widgets)) {
      const widget = widgets[widgetId];
      if (widget.type === newWidget.type) {
        if (widget.instanceId > maxInstanceId) {
          maxInstanceId = widget.instanceId;
        }
      }
    }
    maxInstanceId++;
    newWidget.instanceId = maxInstanceId;
    newWidget.id = newWidget.type + newWidget.instanceId;
    newWidget.content = WidgetFactory.createState(newWidget.type);
  }
  return {
    ...widgets,
    [newWidget.id]: newWidget,
  };
}

function _deleteOne(widgets, widgetIdToDelete) {
  const leftWidgetsId = Object.keys(widgets).filter(id => id !== widgetIdToDelete)
  const newWidgets = {}
  for (const id of leftWidgetsId) {
    newWidgets[id] = widgets[id]
  }
  return newWidgets;
} 

// Reducers
/** 
 * 一个 Widget 的状态由两部分组成：
 * 1. WidgetBox：负责维护 Widget 在 canvas 上的位置、大小（height & width）等
 * 2. content：负责维护 Widget 内的 UI(包括 View 和 交互) 和 数据
 */
export default {
  state: initialState,
  effects: {
    *loadWidgets(action, sagaEffects) {
      const { call, put } = sagaEffects;
      // TODO(ruitao.xu): real user, real app
      const userId = 'user1';
      const appId = 'app1';
      const resp = yield call(widgetsService.loadWidgets, userId, appId);
      yield put(initWidgetsLocal(resp));
    },
    saveWidgets: [function *(action, sagaEffects) {
      const { call, put, select } = sagaEffects;
      const targetAction = action.payload;
      // TODO(ruitao.xu): real user, real app
      const userId = 'user1';
      const appId = 'app1';
      yield put(targetAction);
      logger.debug(`in ${NS}/saveWidgets effect, targetAction: `, targetAction);
      const widgets = yield select(state => state.widgets);

      const resp = yield call(widgetsService.saveWidgets, userId, appId, widgets);
      // BETTER(performance) TODO(ruitao.xu): some action is triggered too frequent, e.g Table.setColumnWidth.
      // make effect 'takeLatest' or debounce widgetService.saveWidgets.
      // when to use 'takeLatest'?
    }, 'takeLatest'],
    *[changeWidgetIdAndSetActiveType](action, { put }) {
      yield put(changeWidgetIdLocal(action.payload));
      yield put(setActiveWidgetId(action.payload.newWidgetId));
    },
  },
  reducers: {
    [initWidgetsType]: (widgets, action) => {
      return action.payload;
    },
    [addOrUpdateWidgetType]: (widgets, action) => {
      const newWidget = action.payload;
      return _addOrUpdate(widgets, newWidget)
    },
    [deleteWidgetType]: (widgets, action) => {
      return _deleteOne(widgets, action.payload.widgetId)
    }, 
    [updateWidgetContentType]: (widgets, action) => {
      const { widgetId, widgetAction } = action.payload;
      logger.debug(`updateWidgetContent(widgetId=${widgetId}, widgetAction=${widgetAction})`);
      if (widgetId in widgets) {
        const widget = widgets[widgetId];
        return {
          ...widgets,
          [widgetId]: {
            ...widget,
            content: WidgetFactory.getReducer(widget.type)(widget.content, widgetAction),
          }
        }
      } else {
        logger.warn(`widgetId('${widgetId}') not found in updateWidgetContent`);
        return widgets;
      }
    },
    [changeWidgetIdType]: (widgets, action) => {
      const { oldWidgetId, newWidgetId } = action.payload;
      logger.debug(`changeWidgetId(oldWidgetId=${oldWidgetId}, newWidgetId=${newWidgetId})`);
      if (newWidgetId in widgets) {
        // CAN NOT rename to an already-existed name
        return widgets;
      } else {
        if (oldWidgetId in widgets) {
          const widget = widgets[oldWidgetId];
          widget.id = newWidgetId;
          const newWidgets = _deleteOne(widgets, oldWidgetId)
          return _addOrUpdate(newWidgets, widget)
        } else {
          logger.warn(`widgetId('${oldWidgetId}') not found in changeWidgetId`);
          return widgets;
        }
      }
    },
  },
};

// Selectors
export const getToEvalTemplates = (widgets) => {
  const widgetTemplates = Object.keys(widgets).map((widgetId) => {
    const widget = widgets[widgetId];
    const tmpls = WidgetFactory.getToEvalTemplates(widget.type)(widget.content);
    return tmpls.map((tmpl) => ({
      id: `${widgetId}.${tmpl.id}`,
      type: tmpl.type,
      input: tmpl.input,
      onEvalActionCreator: (value, extra, error) => updateWidgetContent({
        widgetId,
        widgetAction: tmpl.onEvalActionCreator(value, extra, error),
      }),
    }))
  })

  // @ts-ignore
  return widgetTemplates.flat()
}

export const getEvalContext = (widgets: IWdigetMap) => {
  const exported = {};
  for (const [widgetId, widget] of Object.entries(widgets)) {
    const getExported = WidgetFactory.getRawExportedState(widget.type);
    exported[widgetId] = getExported(widget.content);
  }
  return exported;
}

export const getExportedState = (widgets: IWdigetMap) => {
  const exported = {};
  for (const [widgetId, widget] of Object.entries(widgets)) {
    const getExported = WidgetFactory.getExportedState(widget.type);
    exported[widgetId] = getExported(widget.content);
  }
  return exported;
}