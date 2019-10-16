import { ITemplate } from './common';
import CyclicDependencyError from './CyclicDependencyError';
import DependencyNotMeetError from './DependencyNotMeetError';
import EvalNode, { EvalNodeStateEnum, IEvalNodeMap } from './EvalNode';
import EvalNodeOp from './EvalNodeOp';
import TemplateOp from './TemplateOp';

class EvalTopologyGraph {
  private evalNodeMap: IEvalNodeMap;

  /** build topology graph */
  constructor(templates: ITemplate[]) {
    this.evalNodeMap = {};

    // 1. 生成所有 EvalNode
    for (const template of templates) {
      const nodes = TemplateOp.buildEvalNodes(template);
      for (const node of nodes) {
        this.evalNodeMap[node.id] = node;
      }
    }

    // 2. 构造 EvalNode 间的依赖关系
    for (const node of Object.values(this.evalNodeMap)) {
      const possibleDepIds = EvalNodeOp.listPossibleDepId(node);
      const deps: IEvalNodeMap = {}
      for (const depId of possibleDepIds ) {
        if (depId in this.evalNodeMap) {
          const depNode = this.evalNodeMap[depId];
          deps[depId] = depNode;
        }
      }
      node.addDependency(deps);
    }
  }

  // 前提：节点的状态和依赖关系设置正确
  public evaluate(ctx) {
    let pendingNodes = Object.values(this.evalNodeMap).filter((node) => node.isPending() );

    this.checkCyclicDependency(pendingNodes);
    // remove cyclic dependency nodes
    pendingNodes = pendingNodes.filter((node) => node.isPending() );

    while (pendingNodes.length > 0) {
      const node = pendingNodes.shift();
      const [depState, errDeps] = node.getDepState();

      switch (depState) {
        case EvalNodeStateEnum.Pending:
          pendingNodes.push(node);
          break;
        case EvalNodeStateEnum.Evaluated:
          node.evaluate(ctx);
          break;
        case EvalNodeStateEnum.Error:
          node.setError(new DependencyNotMeetError(`所依赖节点存在错误: [${(errDeps as string[]).join(', ')}]`));
          break;
        default:
          throw new Error(`${node.id} got unexpected depState: ${depState}`);
      }
    }
  }

  private checkCyclicDependency(nodes) {
    interface IFlagMap {
      [key: string]: boolean;
    }

    function _dfs(currentNode: EvalNode, currentPath: EvalNode[], globalVisited: IFlagMap) {
      currentPath.push(currentNode);
      globalVisited[currentNode.id] = true;

      for (const child of Object.values(currentNode.getChildren())) {
        if (currentPath.includes(child)) {
          // found cycle, no need to re-visit
          const cycleNodes: EvalNode[] = [];
          let i = currentPath.length - 1;
          while (currentPath[i].id !== child.id) {
            cycleNodes.push(currentPath[i--]);
          }
          cycleNodes.push(currentPath[i]);

          const cycleNodesCopy = [...cycleNodes];
          for (const node of cycleNodesCopy) {
            // 0 -> 1 -> 2 -> ... -> n -> 0
            const errMsg = cycleNodes.concat(cycleNodes[0]).map((n) => n.id).join('->');
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

    const visited: IFlagMap = {}
    for (const node of nodes) {
      if (!visited[node.id]) {
        const path: EvalNode[] = [];
        _dfs(node, path, visited)
      }
    }
  }
}

export default EvalTopologyGraph;