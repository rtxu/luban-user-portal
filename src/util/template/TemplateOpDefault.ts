import { IDefaultTemplate } from "./common";
import EvalNode, { EvalNodeTypeEnum } from './EvalNode';

export default {
  buildEvalNodes: (template: IDefaultTemplate) => {
    const node = new EvalNode(
      template.id,
      EvalNodeTypeEnum.Default,
      template.input,
      template.onEval,
    );
    return [node]
  }
}