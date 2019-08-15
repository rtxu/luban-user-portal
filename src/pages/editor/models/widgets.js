
const initialWidgets = {};

export default {
  state: initialWidgets,
  reducers: {
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