import TemplateEngine from "./TemplateEngine";
import { assert } from './index';

const EvalState = {
  PENDING: Symbol(),
  EVALUATED: Symbol(),
  ERROR: Symbol(),
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
export class EvalNode {
  constructor(id, tmpl, onPending, onEvaluated, onError) {
    this.id = id;
    this.tmpl = tmpl;
    this.onPending = onPending;
    this.onEvaluated = onEvaluated;
    this.onError = onError;

    // I denpend on my parents
    this.parents = {};
    // my children depend on me
    this.children = {};

    this.setPending();
  }

  setPending() {
    this.value = undefined;
    this.state = EvalState.PENDING;
    this.error = null;
    // 处于 pending 状态时，用户自行决定 value 的取值
    this.onPending();
  }

  setEvaluated(value) {
    this.value = value;
    this.state = EvalState.EVALUATED;
    this.error = null;
    this.onEvaluated(this.value);
  }

  setError(error) {
    this.value = undefined;
    this.state = EvalState.ERROR;
    this.error = error;
    // 处于 ERROR 状态时，用户自行决定 value 的取值
    this.onError(error);
  }

  // 由 EvalTopologyGraph 准备 ctx，并在所有依赖处于 EVALUATED 后调用
  evaluate(ctx, depCtx) {
    assert(this.state === EvalState.PENDING);

    function createOrSetDescendantProp(obj, desc, value) {
      var arr = desc.split('.');
      while (arr.length > 1) {
        const id = arr.shift();
        if (id in obj) {
        } else {
          obj[id] = {};
        }
        obj = obj[id];
      }
      obj[arr[0]] = value;
    }

    const appendCtx = createOrSetDescendantProp;
    const myCtx = {...ctx};
    for (const [depId, depValue] of Object.entries(depCtx)) {
      appendCtx(myCtx, depId, depValue);
    }

    try {
      const value = TemplateEngine.render(this.tmpl, myCtx);
      this.setEvaluated(value);
    } catch (e) {
      this.setError(e);
    }
  }

  setParents(newParents) {
    // old parent remove old child
    for (const parent of Object.values(this.parents)) {
      delete parent.children[this.id];
    }
    this.parents = newParents;
    // new parent add new child
    for (const parent of Object.values(this.parents)) {
      parent.children[this.id] = this;
    }
  }

  getChildren() {
    return this.children;
  }

  getDepState() {
    const errDeps = [];
    const depCtx = {};
    for (const parent of Object.values(this.parents)) {
      switch(parent.state) {
        case EvalState.PENDING:
          return [EvalState.PENDING, errDeps, depCtx];
        case EvalState.ERROR:
          errDeps.push(parent.id);
          break;
        case EvalState.EVALUATED:
          depCtx[parent.id] = parent.value;
          break;
      }
    }
    if (errDeps.length > 0) {
      return [EvalState.ERROR, errDeps, depCtx];
    } else {
      return [EvalState.EVALUATED, errDeps, depCtx];
    }
  }
}

export class CyclicDependencyError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CyclicDependencyError);
    }

    this.name = 'CyclicDependencyError';
  }
}

export class DependencyNotMeetError extends Error {
  constructor(...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CyclicDependencyError);
    }

    this.name = 'DependencyNotMeetError';
  }
}

class EvalTopologyGraph {
  constructor(nodeArr) {
    // 假设所有的节点都有一个唯一的 id，id 可以分很多级，如：a.b.c.d
    // 该 id 如果在 this.evalNodeMap 中，则表示该节点是一个 EvalNode
    // 否则，id 是一个对 Context 的引用
    this.evalNodeMap = {}

    for (const node of nodeArr) {
      this.evalNodeMap[node.id] = node;
    }

    // build dependency
    for (const child of nodeArr) {
      this._buildNodeDependency(child);
    }
  }

  _buildNodeDependency(node) {
    const { depsMap } = TemplateEngine.parse(node.tmpl);
    const parents = {}
    for (const dep of Object.keys(depsMap)) {
      if (dep in this.evalNodeMap) {
        const parent = this.evalNodeMap[dep];
        parents[parent.id] = parent;
      }
    }
    node.setParents(parents);
  }

  // [[[ add/remove/updateEvalNode 都假设在调用前整个 EvalTopologyGraph 中的所有 EvalNode 处于终止状态
  // 事件: 用户新增 widget
  // 新增节点不可能成为别人的依赖，要么是 literal 要么依赖已有节点
  addEvalNode(node) {
    this.evalNodeMap[node.id] = node;
    this._buildNodeDependency(node);
    this._reset();
  }

  // 事件: 用户删除 widget
  // 子节点更新依赖关系，所有后代节点置为 pending
  removeEvalNode(nodeId) {
    const node = this.evalNodeMap[nodeId];
    if (node) {
      delete this.evalNodeMap[nodeId];
      for (const child of Object.values(node.getChildren())) {
        this._buildNodeDependency(child);
      }
      this._reset();
    }
  }

  // 事件: 用户更新 tmpl 内容
  // 1. 更新当前节点的依赖关系
  // 2. 当前节点及其后代节点置为 pending
  updateEvalNode(nodeId, tmpl) {
    const node = this.evalNodeMap[nodeId];
    if (node) {
      node.tmpl = tmpl;
      this._buildNodeDependency(node);
      this._reset();
    }
  }
  // ]]]

  checkCyclicDependency(nodes) {
    function _dfs(currentNode, currentPath, globalVisited) {
      currentPath.push(currentNode);
      globalVisited[currentNode.id] = true;

      for (const child of Object.values(currentNode.getChildren())) {
        if (currentPath.includes(child)) {
          // found cycle, no need to re-visit
          const cycleNodes = [];
          let i = currentPath.length - 1;
          while (currentPath[i].id !== child.id) {
            cycleNodes.push(currentPath[i--]);
          }
          cycleNodes.push(currentPath[i]);

          const cycleNodesCopy = cycleNodes.map(n => n);
          for (const node of cycleNodesCopy) {
            const errMsg = cycleNodes.concat(cycleNodes[0]).map((node) => node.id).join('->');
            node.setError(new CyclicDependencyError(errMsg));
            cycleNodes.push(cycleNodes.shift());
          }
        } else if (globalVisited[child.id]) {
          // no need to re-visit
        } else {
          _dfs(child, currentPath, globalVisited);
        }
      }
      currentPath.pop();
    }

    const visited = {}
    for (const node of nodes) {
      if (!visited[node.id]) {
        const path = [];
        _dfs(node, path, visited)
      }
    }
  }

  _reset() {
    for (const node of Object.values(this.evalNodeMap)) {
      node.state = EvalState.PENDING;
    }
  }

  // 前提：节点的状态和依赖关系设置正确
  evaluate(ctx) {
    let pendingNodes = Object.values(this.evalNodeMap).filter((node) => node.state === EvalState.PENDING);

    this.checkCyclicDependency(pendingNodes);
    // remove cyclic dependency nodes
    pendingNodes = pendingNodes.filter((node) => node.state === EvalState.PENDING);

    while (pendingNodes.length > 0) {
      const node = pendingNodes.shift();
      const [depState, errDeps, depCtx] = node.getDepState();

      switch (depState) {
        case EvalState.PENDING:
          pendingNodes.push(node);
          break;
        case EvalState.EVALUATED:
          node.evaluate(ctx, depCtx);
          break;
        case EvalState.ERROR:
          node.setError(new DependencyNotMeetError(`所依赖节点存在错误: [${errDeps.join(', ')}]`));
          break;
        default:
          throw new Error(`${node.id} got unexpected depState: ${depState}`);
      }
    }
  }
}

export default EvalTopologyGraph;