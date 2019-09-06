const TmplType = {
  Literal: Symbol(),
  Expression: Symbol(),
  TemplateString: Symbol(),
}

// 匹配规则：任何出现在 {{ 和 }} 之间的内容
// 注意：? 使得表达式进入 non-greedy mode，greedy mode 会将多个表达式匹配成一个，非预期效果
const JSCodeSnippetRE = /{{(.*?)}}/g;
// 匹配规则：a.b.c
// \b 代表 word boundary, ref: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Boundaries
const EvalNodeIdRE =/(\w+[.])*\w+\b/g;

function parse(tmpl) {
  const codeSnippetRE = /{{(.*?)}}/g;
  const codeSnippets = [];
  let match;
  while (match = codeSnippetRE.exec(tmpl)) {
    codeSnippets.push(match[1]);
  }
  const depsMap = {};
  for (const code of codeSnippets) {
    const match = code.match(EvalNodeIdRE);
    if (match) {
      for (const dep of match) {
        depsMap[dep] = true;
      }
    }
  }

  const rtnValue = {
    codeSnippets,
    depsMap,
  }

  if (codeSnippets.length === 0) {
    return {
      ...rtnValue,
      type: TmplType.Literal,
    };
  } else if (codeSnippets.length === 1) {
    if (tmpl.trim().length == codeSnippets[0].length + '{{}}'.length) {
      // nothing outside the {{}}
      return {
        ...rtnValue,
        type: TmplType.Expression,
      }
    } else {
      return {
        ...rtnValue,
        type: TmplType.TemplateString,
      }
    }
  } else {
    return {
      ...rtnValue,
      type: TmplType.TemplateString,
    }
  }
}

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
    begin: '`',
    end: '`',
  };
  let functionBody = `return (${TemplateStringMark.begin}`;
  let cursor = 0;
  let match;
  while (match = codeSnippetRE.exec(tmpl)) {
    functionBody += tmpl.slice(cursor, match.index);
    functionBody += '${evaluateExpression(' + match[1] + ', ctx)}'
    cursor = match.index + match[0].length;
  }
  functionBody += tmpl.substr(cursor, tmpl.length - cursor) + `${TemplateStringMark.end})`;
  // console.log('functionBody', functionBody);
  const newCtx = {
    ...ctx,
    ctx,
    evaluateExpression,
  }
  return callFn(functionBody, newCtx);
}

// v1 的缺点：
// 1. 引入了额外的 ctx，ctx 和 evaluateExpression
// 2. 多次调用 evaluateExpression，不知性能如何，未实测
function renderTemplateString(tmpl, ctx) {
  const codeSnippetRE = /{{(.*?)}}/g;
  let code = '\'use strict\'; const r=[];\n';
  let cursor = 0;
  let match;
  const add = function(line, js) {
      js? (code += 'r.push(' + line + ');\n') :
          (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\\\"') + '");\n' : '');
      return add;
  }
  while(match = codeSnippetRE.exec(tmpl)) {
      add(tmpl.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
  }
  add(tmpl.substr(cursor, tmpl.length - cursor));
  code += 'return r.join("");';
  const functionBody = code.replace(/[\r\t\n]/g, '');
  // console.log('functionBody', functionBody);
  return callFn(functionBody, ctx);
}

function render(tmpl, ctx) {
  const { type, codeSnippets } = parse(tmpl);
  switch (type) {
    case TmplType.Literal:
      return tmpl;
    case TmplType.Expression:
      return evaluateExpression(codeSnippets[0], ctx);
    case TmplType.TemplateString:
      return renderTemplateString(tmpl, ctx);
  }
}

const _ = {};
_.TmplType = TmplType;
_.parse = parse;
_.render = render;
export default _;