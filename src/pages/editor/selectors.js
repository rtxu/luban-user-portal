import { createSelector } from 'reselect';
import WidgetFactory from '../../components/WidgetFactory';
import { createDeepEqualSelector } from '@/util/selector';
import EvalTopologyGraph from '@/util/EvalTopologyGraph';
import produce from 'immer';

const getWidgets = (state) => {
  return state.widgets
};

/**
 * 共有两类模板: widget template 和 operation template
 * 共有三类依赖：
 * 1. raw exported field: 其本身有值，不依赖任何其他 widget/operation
 * 2. derived exported field: 依赖其他 widget/operation 的 exported field
 * 3. executed exported field: operation 的模板渲染好后，执行 operation 获得的结果
 * 模板渲染步骤（假设无循环依赖）:
 * 1. 首轮模板渲染
 *    所有依赖于 raw/derived exported field 的模板结果计算完成
 *    仅有依赖于 operation executed exported field 的结果仍处于 「依赖未满足」状态
 * 2. 按拓扑序执行 operation，获得 executed 结果
 * 3. 二轮模板渲染
 */
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