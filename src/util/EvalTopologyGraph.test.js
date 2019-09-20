import EvalTopologyGraph, { CyclicDependencyError, DependencyNotMeetError } from './EvalTopologyGraph';
import { TemplateEntryState } from '../components/widgets/TemplateEntry';

beforeEach(() => {
  console.log('=== beforeEach ===')
})

afterEach(() => {
  console.log('=== afterEach ===')
})

test('simple', () => {
  console.log('=== test: simple ===')
  const templateMap = {
    'widget1.value': {
      template: 'literal template',
    },
  }
  const graph = new EvalTopologyGraph(templateMap);
  graph.evaluate();

  expect(templateMap['widget1.value'].state).toBe(TemplateEntryState.EVALUATED);
  expect(templateMap['widget1.value'].value).toBe('literal template');
})

test('no_cyclic_dependency', () => {
  console.log('=== test: no_cycic_dependency ===')
  const templateMap = {
    'widget0.value': {
      template: 'literal template',
    },
    'widget1.value': {
      template: '{{widget0.value}}',
    },
  }
  const graph = new EvalTopologyGraph(templateMap);
  graph.evaluate();

  expect(templateMap['widget0.value'].state).toBe(TemplateEntryState.EVALUATED);
  expect(templateMap['widget0.value'].value).toBe('literal template');
  expect(templateMap['widget1.value'].state).toBe(TemplateEntryState.EVALUATED);
  expect(templateMap['widget1.value'].value).toBe('literal template');
})

test('onError:CyclicDependencyError', () => {
  console.log('=== test: onError:CyclicDependencyError ===')
  const templateMap = {
    'widget0.value': {
      template: '{{widget1.value}}',
    },
    'widget1.value': {
      template: '{{widget0.value}}',
    },
  }
  const graph = new EvalTopologyGraph(templateMap);
  graph.evaluate();

  expect(templateMap['widget0.value'].state).toBe(TemplateEntryState.ERROR);
  expect(templateMap['widget0.value'].error).toBeInstanceOf(CyclicDependencyError);
  expect(templateMap['widget1.value'].state).toBe(TemplateEntryState.ERROR);
  expect(templateMap['widget1.value'].error).toBeInstanceOf(CyclicDependencyError);
})

test('onError:DependencyNotMeetError', () => {
  console.log('=== test: onError:DependencyNotMeetError ===')
  const templateMap = {
    'widget0.value': {
      template: '{{widget1.value}}',
    },
    'widget1.value': {
      template: '{{widget0.value}}',
    },
    'widget2.value': {
      template: '{{widget0.value}}',
    },
  }
  const graph = new EvalTopologyGraph(templateMap);
  graph.evaluate();

  expect(templateMap['widget0.value'].error).toBeInstanceOf(CyclicDependencyError);
  expect(templateMap['widget1.value'].error).toBeInstanceOf(CyclicDependencyError);
  expect(templateMap['widget2.value'].error).toBeInstanceOf(DependencyNotMeetError);
})
