import { ICtx } from "./common";
import EvalNode from "./EvalNode";

enum DefaultTemplateTypeEnum {
  /** 该模板不包含任何 code snippet(代码片段) */
  Literal,
  /** 该模板仅包含唯一 code snippet 且无任何其他字面量 */
  Expression,
  /** 该模板由 >=1 个 code snippet 和字面量共同组成 */
  TemplateString
}
function parse(input: string) {
  // 匹配规则：a.b.c
  // \b 代表 word boundary, ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Boundaries
  const EvalNodeIdRE = /(\w+[.])*\w+\b/g;
  const codeSnippetRE = /{{(.*?)}}/g;
  const codeSnippets: string[] = [];
  let match;
  while ((match = codeSnippetRE.exec(input))) {
    codeSnippets.push(match[1]);
  }
  /**
   * 在每一个 code snippet 里用正则表达式匹配可能的 id，这并不是一个精确的做法，只是一个保证不遗漏的做法。
   * 只要在该模板内引用数据（如：{{w1.data}}），就能匹配到
   */
  const possibleDepIds: string[] = [];
  for (const code of codeSnippets) {
    const idMatch = code.match(EvalNodeIdRE);
    if (idMatch) {
      for (const depId of idMatch) {
        if (possibleDepIds.includes(depId)) {
          // already exist
        } else {
          possibleDepIds.push(depId);
        }
      }
    }
  }

  const rtnValue = {
    codeSnippets,
    possibleDepIds
  };

  if (codeSnippets.length === 0) {
    return {
      ...rtnValue,
      type: DefaultTemplateTypeEnum.Literal
    };
  } else if (codeSnippets.length === 1) {
    if (input.trim().length === codeSnippets[0].length + "{{}}".length) {
      // nothing outside the {{}}
      return {
        ...rtnValue,
        type: DefaultTemplateTypeEnum.Expression
      };
    } else {
      return {
        ...rtnValue,
        type: DefaultTemplateTypeEnum.TemplateString
      };
    }
  } else {
    return {
      ...rtnValue,
      type: DefaultTemplateTypeEnum.TemplateString
    };
  }
}

// 匹配规则：任何出现在 {{ 和 }} 之间的内容
// 注意：? 使得表达式进入 non-greedy mode，greedy mode 会将多个表达式匹配成一个，非预期效果
const JSCodeSnippetRE = /{{(.*?)}}/g;

// TODO(ruitao.xu): unsafe，这里的 functionBody 并没有做过多限制，用户可能注入恶意代码，要非常小心！
function callFn(functionBody, ctx) {
  const paramNames = [];
  const paramValues = [];
  if (ctx) {
    for (const paramName of Object.keys(ctx)) {
      paramNames.push(paramName);
      paramValues.push(ctx[paramName]);
    }
  }

  // console.log(paramNames, paramValues, functionBody);
  const fn = new Function(...paramNames, functionBody);
  const result = fn.apply(null, paramValues);
  return result;
}

function evaluateExpression(expression, ctx) {
  return callFn(`return (${expression})`, ctx);
}

/**
 * render template based on ctx
 *
 * @param  {string} tmpl      The template we want to render
 * @param  {object} [ctx]     The context used to render template
 * @return {string}           The rendered result
 */
function renderTemplateString_v1_deprecated(tmpl, ctx) {
  // 思路：生成一个模板字符串，js code 的地方使用 evaluateExpression 获得结果
  const codeSnippetRE = /{{(.*?)}}/g;
  const TemplateStringMark = {
    begin: "`",
    end: "`"
  };
  let functionBody = `return (${TemplateStringMark.begin}`;
  let cursor = 0;
  let match;
  while ((match = codeSnippetRE.exec(tmpl))) {
    functionBody += tmpl.slice(cursor, match.index);
    functionBody += "${evaluateExpression(" + match[1] + ", ctx)}";
    cursor = match.index + match[0].length;
  }
  functionBody +=
    tmpl.substr(cursor, tmpl.length - cursor) + `${TemplateStringMark.end})`;
  // console.log('functionBody', functionBody);
  const newCtx = {
    ...ctx,
    ctx,
    evaluateExpression
  };
  return callFn(functionBody, newCtx);
}

// v1 的缺点：
// 1. 引入了额外的 ctx，ctx 和 evaluateExpression
// 2. 多次调用 evaluateExpression，不知性能如何，未实测
function renderTemplateString(tmpl, ctx) {
  const codeSnippetRE = /{{(.*?)}}/g;
  let code = "'use strict'; const r=[];\n";
  let cursor = 0;
  let match;
  const add = (line: string, js?: boolean) => {
    js
      ? (code += "r.push(" + line + ");\n")
      : (code +=
          line !== ""
            ? 'r.push("' + line.replace(/"/g, '\\\\"') + '");\n'
            : "");
    return add;
  };
  while ((match = codeSnippetRE.exec(tmpl))) {
    add(tmpl.slice(cursor, match.index))(match[1], true);
    cursor = match.index + match[0].length;
  }
  add(tmpl.substr(cursor, tmpl.length - cursor));
  code += 'return r.join("");';
  const functionBody = code.replace(/[\r\t\n]/g, "");
  // console.log('functionBody', functionBody);
  return callFn(functionBody, ctx);
}

function render(tmpl, ctx) {
  const { type, codeSnippets } = parse(tmpl);
  switch (type) {
    case DefaultTemplateTypeEnum.Literal:
      return tmpl;
    case DefaultTemplateTypeEnum.Expression:
      return evaluateExpression(codeSnippets[0], ctx);
    case DefaultTemplateTypeEnum.TemplateString:
      return renderTemplateString(tmpl, ctx);
  }
}

export default {
  listPossibleDepId: (node: EvalNode) => {
    const { possibleDepIds } = parse(node.input);
    return possibleDepIds;
  },
  evaluate(node: EvalNode, ctx: ICtx) {
    function createOrSetDescendantProp(obj, desc: string, value) {
      const arr = desc.split(".");
      while (arr.length > 1) {
        const id = arr.shift();
        if (id in obj) {
          // already exist
        } else {
          obj[id] = {};
        }
        obj = obj[id];
      }
      obj[arr[0]] = value;
    }

    const appendCtx = createOrSetDescendantProp;
    const myCtx = { ...ctx };
    const depCtx = node.getDepCtx();
    for (const [depId, depValue] of Object.entries(depCtx)) {
      appendCtx(myCtx, depId, depValue);
    }

    try {
      const value = render(node.input, myCtx);
      node.setEvaluated(value);
    } catch (e) {
      node.setError(e);
    }
  }
};
