
/**
 * render template based on ctx
 *
 * @param  {string} tmpl      The template we want to render
 * @param  {object} [ctx]     The context used to render template
 * @return {string}           The rendered result
 */
export default function(tmpl, ctx) {
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