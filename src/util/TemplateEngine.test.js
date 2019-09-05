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

test('parse template for deps', () => {
  {
    let { depsMap } = TemplateEngine.parse(' {{a.b.c}} {{aa.bb.cc}} {{aaa.b.ccc}}');
    expect(Object.keys(depsMap)).toContain('a.b.c');
    expect(Object.keys(depsMap)).toContain('aa.bb.cc');
    expect(Object.keys(depsMap)).toContain('aaa.b.ccc');
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

test('render expression', () => {
  expect(TemplateEngine.render('{{ undefined }}')).toBeUndefined();
  expect(TemplateEngine.render('{{ null }}')).toBeNull();
  expect(TemplateEngine.render('{{ 5 }}')).toBe(5);
  expect(TemplateEngine.render('{{ "str" }}')).toBe("str");
  expect(TemplateEngine.render('{{ [1, 2, 3] }}')).toEqual([1, 2, 3]);
  expect(TemplateEngine.render('{{ [a, b, c] }}', {a:1, b: 2, c:3})).toEqual([1, 2, 3]);
  expect(() => TemplateEngine.render('{{ reference_error }}')).toThrow(ReferenceError);
  expect(() => TemplateEngine.render('{{ }}')).toThrow(SyntaxError);
})