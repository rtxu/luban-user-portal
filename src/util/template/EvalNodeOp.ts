import { ICtx } from "./common";
import EvalNode, { EvalNodeTypeEnum } from "./EvalNode";
import AlasqlOp from "./EvalNodeOpAlasql";
import DefaultOp from "./EvalNodeOpDefault";

/** 不管是什么类型的 EvalNode，对外提供统一接口，抽象掉由类型引入的差异 */
export default {
  listPossibleDepId: (node: EvalNode) => {
    switch (node.type) {
      case EvalNodeTypeEnum.Default:
        return DefaultOp.listPossibleDepId(node);
      case EvalNodeTypeEnum.Alasql:
        return AlasqlOp.listPossibleDepId(node);
      default:
        throw new Error(`unexpected eval note type: ${node.type}`);
    }
  },
  evaluate(node: EvalNode, ctx: ICtx) {
    switch (node.type) {
      case EvalNodeTypeEnum.Default:
        return DefaultOp.evaluate(node, ctx);
      case EvalNodeTypeEnum.Alasql:
        return AlasqlOp.evaluate(node, ctx);
      default:
        throw new Error(`unexpected eval note type: ${node.type}`);
    }
  }
};
