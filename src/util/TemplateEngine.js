const TmplType = {
  Literal: Symbol(),
  Expression: Symbol(),
  TemplateString: Symbol(),
}

// 匹配规则：任何出现在 {{ 和 }} 之间的内容
// 注意：? 使得表达式进入 non-greedy mode，greedy mode 会将多个表达式匹配成一个，非预期效果
const JSCodeSnippetRE = /{{(.*?)}}/g;

function parse(tmpl) {
  const codeSnippetRE = /{{(.*?)}}/g;
  const codeSnippets = [];
  let match;
  while (match = codeSnippetRE.exec(tmpl)) {
    codeSnippets.push(match[1]);
  }

  if (codeSnippets.length === 0) {
    return {
      type: TmplType.Literal,
      codeSnippets,
    };
  } else if (codeSnippets.length === 1) {
    if (tmpl.trim().length == codeSnippets[0].length + '{{}}'.length) {
      // no other string
      return {
        type: TmplType.Expression,
        codeSnippets,
      }
    } else {
      return {
        type: TmplType.TemplateString,
        codeSnippets,
      }
    }
  } else {
    return {
      type: TmplType.TemplateString,
      codeSnippets,
    }
  }
}

function renderExpression(tmpl, ctx) {
  const re = /{{([^}]+)?}}/g;
  const reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
  let code = 'var r=[];\n';
  let cursor = 0;
  let match;
  const add = function(line, js) {
      js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
          (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\\\"') + '");\n' : '');
      return add;
  }
  while(match = re.exec(tmpl)) {
      add(tmpl.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
  }
  add(tmpl.substr(cursor, tmpl.length - cursor));
  code += 'return r.join("");';

  const paramKeys = [];
  const paramValues = [];
  if (ctx) {
    for (const paramKey of Object.keys(ctx)) {
      paramKeys.push(paramKey);
      paramValues.push(ctx[paramKey]);
    }
  }

  // console.log('function param name: ', paramKeys);
  // console.log('function param value: ', paramValues);
  // console.log('code: \n', code);
  const functionBody = code.replace(/[\r\t\n]/g, '');
  // console.log('function body: ', functionBody);
  const fn = new Function(...paramKeys, functionBody);
  const result = fn.apply(null, paramValues);
  return result;
}

/**
 * render template based on ctx
 *
 * @param  {string} tmpl      The template we want to render
 * @param  {object} [ctx]     The context used to render template
 * @return {string}           The rendered result
 */
function renderTemplateString(tmpl, ctx) {
  const re = /{{([^}]+)?}}/g;
  const reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
  let code = 'var r=[];\n';
  let cursor = 0;
  let match;
  const add = function(line, js) {
      js? (code += line.match(reExp) ? line + '\n' : 'r.push(' + line + ');\n') :
          (code += line != '' ? 'r.push("' + line.replace(/"/g, '\\\\"') + '");\n' : '');
      return add;
  }
  while(match = re.exec(tmpl)) {
      add(tmpl.slice(cursor, match.index))(match[1], true);
      cursor = match.index + match[0].length;
  }
  add(tmpl.substr(cursor, tmpl.length - cursor));
  code += 'return r.join("");';

  const paramKeys = [];
  const paramValues = [];
  if (ctx) {
    for (const paramKey of Object.keys(ctx)) {
      paramKeys.push(paramKey);
      paramValues.push(ctx[paramKey]);
    }
  }

  // console.log('function param name: ', paramKeys);
  // console.log('function param value: ', paramValues);
  // console.log('code: \n', code);
  const functionBody = code.replace(/[\r\t\n]/g, '');
  // console.log('function body: ', functionBody);
  const fn = new Function(...paramKeys, functionBody);
  const result = fn.apply(null, paramValues);
  return result;
}

function render(tmpl, ctx) {
  const { type } = parse(tmpl);
  switch (type) {
    case TmplType.Literal:
      return tmpl;
    case TmplType.Expression:
      return renderExpression(tmpl, ctx);
    case TmplType.TemplateString:
      return renderTemplateString(tmpl, ctx);
  }
}

const _ = {};
_.TmplType = TmplType;
_.parse = parse;
_.render = render;
export default _;