import alasql from 'alasql';

import { ICtx } from './common';
import EvalNode from './EvalNode';

export default {
  listPossibleDepId: (node: EvalNode) => {
    return [];
  },
  async evaluate(node: EvalNode, ctx: ICtx) {
    const params = [];
    const paramCnt = node.getDepCount();
    const depCtx = node.getDepCtx();
    for (let i = 0; i < paramCnt ; i++) {
      const param = depCtx[`${node.id}.param.${i}`]
      params.push(param);
    }
    try {
      const data = await alasql.promise(node.input, params);
      node.setEvaluated(data, {
        preparedSql: node.input,
        params,
      });
    } catch (e) {
      node.setError(e);
    }
  },
}