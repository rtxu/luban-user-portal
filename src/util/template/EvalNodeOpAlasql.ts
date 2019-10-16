import { ICtx } from './common';
import EvalNode from './EvalNode';

export default {
  listPossibleDepId: (node: EvalNode) => {
    return [];
  },
  evaluate(node: EvalNode, ctx: ICtx) {
    const params = [];
    const paramCnt = node.getDepCount();
    const depCtx = node.getDepCtx();
    for (let i = 0; i < paramCnt ; i++) {
      const param = depCtx[`${node.id}.param.${i}`]
      params.push(param);
    }
    node.setEvaluated({
      sqlTemplate: node.input,
      params,
    });
  },
}