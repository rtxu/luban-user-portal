import TemplateEngine from './TemplateEngine';

test('parse template', () => {
  {
    let { type, codeSnippets } = TemplateEngine.parse('1+1');
    expect(type).toBe(TemplateEngine.TmplType.Literal);
    expect(codeSnippets).toEqual([]);
  }
  {
    let { type, codeSnippets } = TemplateEngine.parse('{{1+1}}');
    expect(type).toBe(TemplateEngine.TmplType.Expression);
    expect(codeSnippets).toEqual(['1+1']);
  }
  {
    let { type, codeSnippets } = TemplateEngine.parse(' {{ 1 + 1 }} ');
    expect(type).toBe(TemplateEngine.TmplType.Expression);
    expect(codeSnippets).toEqual([' 1 + 1 ']);
  }
  {
    let { type, codeSnippets } = TemplateEngine.parse(' {{ 1 + 1 }} s')
    expect(type).toBe(TemplateEngine.TmplType.TemplateString);
    expect(codeSnippets).toEqual([' 1 + 1 ']);
  }
  {
    let { type, codeSnippets } = TemplateEngine.parse('{{1+1}} = {{1+1}}')
    expect(type).toBe(TemplateEngine.TmplType.TemplateString);
    expect(codeSnippets).toEqual(['1+1', '1+1']);
  }
})

test('render without ctx', () => {
  // undefined
  expect(TemplateEngine.render('1+1 = {{1+1}}')).toBe('1+1 = 2');

  // null
  expect(TemplateEngine.render('1+1 = {{1+1}}', null)).toBe('1+1 = 2');

  // empty {}
  expect(TemplateEngine.render('1+1 = {{1+1}}', {})).toBe('1+1 = 2');
})

test('render with ctx', () => {
  const ctx = {
    a: 1,
    b: 1,
  }
  expect(TemplateEngine.render('a+b = {{a+b}}', ctx)).toBe('a+b = 2');
})
