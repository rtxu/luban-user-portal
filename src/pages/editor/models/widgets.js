import * as widgetsService from "../services/widgets";

const initialWidgets = {};

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
    *saveWidgets(action, sagaEffects) {
      const { call, put } = sagaEffects;
      const { userId, appId, targetAction } = action.payload;
      yield put(targetAction);
      // TODO(ruitao.xu): better way to getState?
      const widgets = window.g_app._store.getState()['widgets'];

      const resp = yield call(widgetsService.saveWidgets, userId, appId, widgets);
      console.log(resp);
    },
  },
  reducers: {
    initWidgets(widgets, action) {
      console.log('here', action.payload);
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
      }
      return {
        ...widgets, 
        [newWidget.id]: newWidget,
      };
    },
    setHover(widgets, action) {
      return {
        ...widgets,
        [action.widgetId]: {
          ...widgets[action.widgetId],
          isHover: true,
        },
      };
    },
    clearHover(widgets, action) {
      return {
        ...widgets,
        [action.widgetId]: {
          ...widgets[action.widgetId],
          isHover: false,
        },
      };
    },

  },
};