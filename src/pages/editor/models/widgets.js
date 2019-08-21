import * as widgetsService from '../services/widgets';
import WidgetFactory from '@/components/WidgetFactory';
import { createLogger } from '@/util';

const logger = createLogger('/pages/editor/models/widgets');

const initialWidgets = {};
export const NS = 'widgets';

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

/*
  一个 Widget 的状态由两部分组成：
  1. WidgetBox：负责维护 Widget 在 canvas 上的位置、大小（height & width）等
  2. content：负责维护 Widget 内的 UI(包括 View 和 交互) 和 数据
*/
export default {
  state: initialWidgets,
  effects: {
    *loadWidgets(action, sagaEffects) {
      const { call, put } = sagaEffects;
      const { userId, appId } = action.payload;
      const resp = yield call(widgetsService.loadWidgets, userId, appId);
      yield put({
        type: 'initWidgets',
        payload: resp,
      });
    },
    saveWidgets: [function *(action, sagaEffects) {
      const { call, put, select } = sagaEffects;
      const targetAction = action.payload;
      const { userId, appId } = targetAction.payload;
      logger.debug(`in ${NS}/saveWidgets effect, targetAction: `, targetAction);
      yield put(targetAction);
      const widgets = yield select(state => state.widgets);

      const resp = yield call(widgetsService.saveWidgets, userId, appId, widgets);
    }, 'takeLatest'],
  },
  reducers: {
    initWidgets(widgets, action) {
      return action.payload;
    },
    addOrUpdate(widgets, action) {
      const newWidget = { ...action.payload.widget }
      if ('id' in newWidget ) {
        // update

      } else {
        // add
        let maxInstanceId = 0;
        for (let widgetId of Object.keys(widgets)) {
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
    },
    updateContent(widgets, action) {
      const widgetId = action.payload.widgetId;
      if (widgetId in widgets) {
        const widget = widgets[widgetId];
        return {
          ...widgets,
          [widgetId]: {
            ...widget,
            content: WidgetFactory.getReducer(widget.type)(widget.content, action.payload.widgetAction),
          }
        }
      } else {
        console.log(`widgetId('${widgetId}') not found in updateContent`);
        return widgets;
      }
    },
  },
};