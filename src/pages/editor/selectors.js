import { createSelector } from 'reselect';
import WidgetFactory from '../../components/WidgetFactory';
import { createDeepEqualSelector } from '@/util/selector';
import EvalTopologyGraph from '@/util/EvalTopologyGraph';
import produce from 'immer';

const getWidgets = (state) => {
  return state.widgets
};

const getTemplateMapAndExportedContext = createSelector(
  [getWidgets],
  (widgets) => {
    console.log(`all widgets in getTemplateMapAndExportedContext: ${Object.keys(widgets)}`);
    const templateMap = {};
    const exportedContext = {};
    for (const [widgetId, widget] of Object.entries(widgets)) {
      const getExportedState = WidgetFactory.getExportedStateNoTemplate(widget.type);
      exportedContext[widgetId] = getExportedState(widget.content);

      if (widget.content.templateMap) {
        for (const [propId, templateObj] of Object.entries(widget.content.templateMap)) {
          templateMap[`${widgetId}.${propId}`] = {...templateObj};
        }
      }
    }
    console.log('templateMap before evaluate: ', templateMap);
    console.log('exported context: ', exportedContext);
    return {
      templateMap,
      exportedContext,
    }
  }
)

const getEvaluatedTemplateMap = createDeepEqualSelector(
  [getTemplateMapAndExportedContext],
  ({templateMap, exportedContext}) => {
    console.log(`all templates in getEvaluatedTemplateMap: ${Object.keys(templateMap)}`);
    const toEvaluateTemplateMap = {};
    for (const [tmplId, tmplEntry] of Object.entries(templateMap)) {
      toEvaluateTemplateMap[tmplId] = {...tmplEntry};
    }
    const graph = new EvalTopologyGraph(toEvaluateTemplateMap);
    graph.evaluate(exportedContext);
    const evaluatedTemplateMap = toEvaluateTemplateMap;
    console.log('evaluated template map: ', evaluatedTemplateMap);

    return evaluatedTemplateMap;
  }
)

export const getEvaluatedWidgets = createSelector(
  [getWidgets, getEvaluatedTemplateMap],
  (widgets, evaluatedTemplateMap) => {
    return produce(widgets, draft => {
      for (const [widgetId, widget] of Object.entries(draft)) {
        const templateMap = widget.content.templateMap;
        if (templateMap) {
          for (const propId of Object.keys(templateMap)) {
            templateMap[propId] = evaluatedTemplateMap[`${widgetId}.${propId}`];
          }
        }
      }
    })
  }
)