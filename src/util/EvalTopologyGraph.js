import alasql from 'alasql';

import TemplateEngine from "./TemplateEngine";
import { TemplateEntryState } from '@/components/widgets/TemplateEntry';
import { assert } from './index';

const EvalState = {
  PENDING: TemplateEntryState.PENDING,
  EVALUATED: TemplateEntryState.EVALUATED,
  ERROR: TemplateEntryState.ERROR,
}

function asyncRunSql(statement, params) {
  // console.log('async run sql: ', statement, 'params: ', params)
  return alasql.promise(statement, params);
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
  constructor(id, tmpl, type) {
    this.id = id;
    this.tmpl = tmpl;
    this.type = type;

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
    // console.log('evaluated: ', this.id, 'value: ', value);
    this.tmpl.value = value;
    this.tmpl.state = EvalState.EVALUATED;
    this.tmpl.error = null;
  }

  setError(error) {
    // console.log('error happened: ', this.id, 'error: ', error);
    this.tmpl.value = undefined;
    this.tmpl.state = EvalState.ERROR;
    this.tmpl.error = error;
  }

  evaluate(ctx, depCtx) {
    /*
    console.log('to evaluate: ', this.id);
    console.log('template: ', this.tmpl);
    console.log('ctx: ', ctx);
    console.log('depCtx: ', depCtx);
    */
    if (this.type === 'templateString') {
      return this._evaluateTemplateString(ctx, depCtx);
    } else if (this.type === 'sql') {
      return this._evaluateSql(depCtx)
    }
  }

  _evaluateSql(depCtx) {
    const params = [];
    const paramCnt = Object.keys(this.parents).length;
    const sqlId = this.id.substring(0, this.id.length - '.data'.length);
    for (let i = 0; i < paramCnt ; i++) {
      const param = depCtx[sqlId + `.param[${i}]`]
      params.push(param);
    }
    asyncRunSql(this.tmpl.template, params)
      .then((data) => {
        this.setEvaluated(data);
      }).catch((e) => {
        this.setError(e);
      })
  }

  // 由 EvalTopologyGraph 准备 ctx，并在所有依赖处于 EVALUATED 后调用
  _evaluateTemplateString(ctx, depCtx) {
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

  appendParents(newParents) {
    for (const parent of Object.values(newParents)) {
      this.parents[parent.id] = parent;
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
  constructor(templateMap, sqlTemplateMap) {
    // 假设所有的节点都有一个唯一的 id，id 可以分很多级，如：a.b.c.d
    // 该 id 如果在 this.evalNodeMap 中，则表示该节点是一个 EvalNode
    // 否则，id 是一个对 Context 的引用
    this.evalNodeMap = {}

    for (const [tmplId, tmplEntry] of Object.entries(templateMap)) {
      const node = new EvalNode(tmplId, tmplEntry, 'templateString');
      this.evalNodeMap[node.id] = node;
    }

    if (sqlTemplateMap) {
      for (const [sqlId, sqlTmpl] of Object.entries(sqlTemplateMap)) {
        const {preparedSqlStatement, params } = TemplateEngine.parseSql(sqlTmpl.template);
        const node = new EvalNode(sqlId + '.data', {template: preparedSqlStatement}, 'sql');
        this.evalNodeMap[node.id] = node;
        const parents = {};
        for (let i = 0; i < params.length; i++) {
          const node = new EvalNode(sqlId + `.param[${i}]`, { template: params[i] }, 'templateString');
          this.evalNodeMap[node.id] = node;
          parents[node.id] = node;
        }
        // to run sql, all params need be evaluated
        node.appendParents(parents);
      }
    }

    // console.log('dump evalNodeMap')
    // build dependency
    for (const child of Object.values(this.evalNodeMap)) {
      this._buildNodeDependency(child);
      // console.log('id: ', child.id, 'tmpl: ', child.tmpl.template, 'parents: ', Object.keys(child.parents));
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
    node.appendParents(parents);
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