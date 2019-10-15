import { ErrorT, ICtx, OnEvalT } from './common';
import EvalNodeOp from './EvalNodeOp';

export enum EvalNodeTypeEnum {
  Default,
  Alasql,
}

export interface IEvalNodeMap {
  [id: string]: EvalNode;
}

export enum EvalNodeStateEnum {
  Pending,
  Evaluated,
  Error,
}

/**
 * 状态机:
 *   用户修改 input           topoGraph 调用 evaluate  
 *  --------------> PENDING -----------------------> EVALUATED
 *                     |                  \
 *                     |                   --------> ERROR
 *                     |                  / 
 *                     ------------------
 *                     topoGraph 判定循环依赖
 * 用户输入不变，处于 EVALUATED 和 ERROR 状态的节点不会更新，因此被称为终止态
 */
class EvalNode {
  public readonly id: string;
  public readonly type: EvalNodeTypeEnum;
  public readonly input: string;
  public value: any = null;

  private state: EvalNodeStateEnum = EvalNodeStateEnum.Pending;
  private readonly onEval: OnEvalT | undefined;
  /** I depend on my parents */
  private parents: IEvalNodeMap = {};
  /** My children depend on me */
  private children: IEvalNodeMap = {};

  constructor(id: string, type: EvalNodeTypeEnum, input: string, onEval?: OnEvalT) {
    this.id = id;
    this.type = type;
    this.input = input;
    this.onEval = onEval;
  }

  public addDependency(deps: IEvalNodeMap) {
    for (const dep of Object.values(deps)) {
      this.parents[dep.id] = dep;
      dep.children[this.id] = this;
    }
  }

  public isPending() {
    return this.state === EvalNodeStateEnum.Pending;
  }

  public getDepState(): [EvalNodeStateEnum, string[]] {
    const errDeps: string[] = [];
    for (const depNode of Object.values(this.parents)) {
      switch(depNode.state) {
        case EvalNodeStateEnum.Pending:
          return [EvalNodeStateEnum.Pending, errDeps];
        case EvalNodeStateEnum.Error:
          errDeps.push(depNode.id);
          break;
        case EvalNodeStateEnum.Evaluated:
          break;
      }
    }
    if (errDeps.length > 0) {
      return [EvalNodeStateEnum.Error, errDeps];
    } else {
      return [EvalNodeStateEnum.Evaluated, errDeps];
    }
  }
  
  public getDepCount() {
    return Object.keys(this.parents).length;
  }

  public getDepCtx(): {[key: string]: any} {
    return Object.keys(this.parents).reduce((ctx, id) => {
      ctx[id] = this.parents[id].value;
      return ctx;
    }, {});
  }

  public isDependOn(depId: string) {
    return depId in this.parents;
  }

  public evaluate(ctx: ICtx) {
    return EvalNodeOp.evaluate(this, ctx);
  }

  public setError(error: ErrorT) {
    this._setEvaluated(null, null, error);
  }

  public getChildren() {
    return this.children;
  }

  public setEvaluated(value, extra = null) {
    this._setEvaluated(value, extra, null);
  }

  private _setEvaluated(value, extra, error: ErrorT) {
    this.value = value;
    this.state = error ? EvalNodeStateEnum.Error: EvalNodeStateEnum.Evaluated;
    if (this.onEval) {
      this.onEval(value, extra, error);
    }
  }
}

export default EvalNode;