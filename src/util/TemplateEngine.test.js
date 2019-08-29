import TemplateEngine from './TemplateEngine';

test('no ctx', () => {
  // undefined
  expect(TemplateEngine('1+1 = {{1+1}}')).toBe('1+1 = 2');

  // null
  expect(TemplateEngine('1+1 = {{1+1}}', null)).toBe('1+1 = 2');

  // empty {}
  expect(TemplateEngine('1+1 = {{1+1}}', {})).toBe('1+1 = 2');
})

test('ctx', () => {
  const ctx = {
    a: 1,
    b: 1,
  }
  expect(TemplateEngine('a+b = {{a+b}}', ctx)).toBe('a+b = 2');
})