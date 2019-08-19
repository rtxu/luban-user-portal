import * as widgetsService from '../services/widgets';
import WidgetFactory from '@/components/WidgetFactory';

const initialWidgets = {};

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
      const { userId, appId, targetAction } = action.payload;
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
      const newWidget = { ...action.widget }
      if ('id' in action.widget ) {
        // update

      } else {
        // add
        let maxInstanceId = 0;
        for (let widgetId of Object.keys(widgets)) {
          const widget = widgets[widgetId];
          if (widget.type === action.widget.type) {
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

  },
};