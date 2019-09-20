import TemplateEngine from "./TemplateEngine";
import { TemplateEntryState } from '@/components/widgets/TemplateEntry';
import { assert } from './index';

const EvalState = {
  PENDING: TemplateEntryState.PENDING,
  EVALUATED: TemplateEntryState.EVALUATED,
  ERROR: TemplateEntryState.ERROR,
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
  constructor(id, tmpl) {
    this.id = id;
    this.tmpl = tmpl;

    // I denpend on my parents
    this.parents = {};
    // my children depend on me
    this.children = {};

    this.setPending();
  }

  getTemplate() {
    return this.tmpl.template;
  }

  setPending() {
    this.tmpl.value = undefined;
    this.tmpl.state = EvalState.PENDING;
    this.tmpl.error = null;
  }

  setEvaluated(value) {
    this.tmpl.value = value;
    this.tmpl.state = EvalState.EVALUATED;
    this.tmpl.error = null;
  }

  setError(error) {
    this.tmpl.value = undefined;
    this.tmpl.state = EvalState.ERROR;
    this.tmpl.error = error;
  }

  // 由 EvalTopologyGraph 准备 ctx，并在所有依赖处于 EVALUATED 后调用
  evaluate(ctx, depCtx) {
    assert(this.tmpl.state === EvalState.PENDING);

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
      const value = TemplateEngine.render(this.tmpl.template, myCtx);
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
      switch(parent.tmpl.state) {
        case EvalState.PENDING:
          return [EvalState.PENDING, errDeps, depCtx];
        case EvalState.ERROR:
          errDeps.push(parent.id);
          break;
        case EvalState.EVALUATED:
          depCtx[parent.id] = parent.tmpl.value;
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
  constructor(templateMap) {
    // 假设所有的节点都有一个唯一的 id，id 可以分很多级，如：a.b.c.d
    // 该 id 如果在 this.evalNodeMap 中，则表示该节点是一个 EvalNode
    // 否则，id 是一个对 Context 的引用
    this.evalNodeMap = {}

    for (const [tmplId, tmplEntry] of Object.entries(templateMap)) {
      const node = new EvalNode(tmplId, tmplEntry);
      this.evalNodeMap[node.id] = node;
    }

    // build dependency
    for (const child of Object.values(this.evalNodeMap)) {
      this._buildNodeDependency(child);
    }
  }

  _buildNodeDependency(node) {
    const { depsMap } = TemplateEngine.parse(node.getTemplate());
    const parents = {}
    for (const dep of Object.keys(depsMap)) {
      if (dep in this.evalNodeMap) {
        const parent = this.evalNodeMap[dep];
        parents[parent.id] = parent;
      }
    }
    node.setParents(parents);
  }

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

  // 前提：节点的状态和依赖关系设置正确
  evaluate(ctx) {
    let pendingNodes = Object.values(this.evalNodeMap).filter((node) => node.tmpl.state === EvalState.PENDING);

    this.checkCyclicDependency(pendingNodes);
    // remove cyclic dependency nodes
    pendingNodes = pendingNodes.filter((node) => node.tmpl.state === EvalState.PENDING);

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