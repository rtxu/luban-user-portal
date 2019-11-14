import { IAlasqlTemplate } from "./common";
import EvalNode, { EvalNodeTypeEnum } from "./EvalNode";

/**
 * example:
 * input: 'select * from {{table1.data}} where id={{textinput1.value}}'
 * returns: {
 *  preparedSql: 'select * from ? where id=?',
 *  params: [{{table1.data}}, {{textinput1.value}}],
 * }
 */
export function parseSqlTemplate(input: string) {
  let preparedSql = "";
  const params: string[] = [];
  const codeSnippetRE = /{{(.*?)}}/g;
  let cursor = 0;
  let match;
  while ((match = codeSnippetRE.exec(input))) {
    preparedSql += input.slice(cursor, match.index) + "?";
    cursor = match.index + match[0].length;
    params.push(match[0]);
  }
  preparedSql += input.substring(cursor);
  return {
    preparedSql,
    params
  };
}

export default {
  buildEvalNodes: (template: IAlasqlTemplate) => {
    const { preparedSql, params } = parseSqlTemplate(template.input);
    const sqlNode = new EvalNode(
      template.id,
      EvalNodeTypeEnum.Alasql,
      preparedSql,
      template.onEval
    );
    const deps = {};
    for (let i = 0; i < params.length; i++) {
      const paramNode = new EvalNode(
        `${template.id}.param.${i}`,
        EvalNodeTypeEnum.Default,
        params[i]
        // intermediate node, no need callback
      );
      deps[paramNode.id] = paramNode;
    }
    // 仅负责构造 template 内部的依赖关系
    // to run sql, all params need be evaluated
    sqlNode.addDependency(deps);

    return [sqlNode].concat(Object.values(deps));
  }
};
