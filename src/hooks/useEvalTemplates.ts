import { useDeepCompareEffect } from "react-use";

import { evaluate } from "../util/template";
import { getToEvalTemplates, getEvalContext } from "../models/widgets";
import {
  getToEvalTemplates as opGetToEvalTemplates,
  getEvalContext as opGetEvalContext
} from "../models/operations";

export default (widgets, operations, dispatch) => {
  const widgetTemplates = getToEvalTemplates(widgets);
  const widgetContext = getEvalContext(widgets);
  const opTemplates = opGetToEvalTemplates(operations);
  const opContext = opGetEvalContext(operations);
  const toEvalTemplates = [...widgetTemplates, ...opTemplates];
  const evalContext = { ...widgetContext, ...opContext };
  const evalEnv = {
    plainObjTemplates: toEvalTemplates.map(tmpl => ({
      id: tmpl.id,
      type: tmpl.type,
      input: tmpl.input
    })),
    evalContext
  };

  useDeepCompareEffect(() => {
    // TODO(ruitao.xu): use reselect to avoid unnecessary re-render
    /*
    console.log("trigger re-evaluate");
    console.log("to eval templates: ", toEvalTemplates);
    console.log("eval context: ", evalContext);
    */
    const templates = toEvalTemplates.map(tmpl => ({
      id: tmpl.id,
      type: tmpl.type,
      input: tmpl.input,
      onEval: (value, extra, error) => {
        // console.log("evaluated", value, extra, error);
        const action = tmpl.onEvalActionCreator(value, extra, error);
        // console.log("action", action);
        dispatch(action);
      }
    }));
    evaluate(templates, evalContext);
  }, [evalEnv]);
};
