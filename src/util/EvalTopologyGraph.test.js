import EvalTopologyGraph, { EvalNode, CyclicDependencyError, DependencyNotMeetError } from './EvalTopologyGraph';

const MAX_EVAL_NODE_CNT = 10;
let mockOnPendingArr = [];
let mockOnEvaluatedArr = [];
let mockOnErrorArr = [];
beforeEach(() => {
  console.log('=== beforeEach ===')
  for (let i = 0; i < MAX_EVAL_NODE_CNT; i++) {
    mockOnPendingArr.push(jest.fn());
    mockOnEvaluatedArr.push(jest.fn());
    mockOnErrorArr.push(jest.fn());
  }
})

afterEach(() => {
  console.log('=== afterEach ===')
  mockOnPendingArr = [];
  mockOnEvaluatedArr = [];
  mockOnErrorArr = [];
})

test('constructor:simple', () => {
  console.log('=== test: constructor:simple ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget1.value', 'literal template', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);

  expect(nodeArr[0].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[0].onEvaluated.mock.calls[0][0]).toBe('literal template');
})

test('constructor:no_cyclic_dependency', () => {
  console.log('=== test: constructor:no_cycic_dependency ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', 'literal template', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget1.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);

  expect(nodeArr[0].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[0].onEvaluated.mock.calls[0][0]).toBe('literal template');
  expect(nodeArr[1].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[1].onEvaluated.mock.calls[0][0]).toBe('literal template');
})

test('constructor:cyclic_dependency', () => {
  console.log('=== test: constructor:cycic_dependency ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', '{{widget1.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget1.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);

  expect(nodeArr[0].onError.mock.calls.length).toBe(1);
  expect(nodeArr[0].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[1].onError.mock.calls.length).toBe(1);
  expect(nodeArr[1].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
})

test('constructor:some_node_depent_on_cyclic_node', () => {
  console.log('=== test: constructor:some_node_depent_on_cyclic_node ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', '{{widget1.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget1.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget2.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);

  expect(nodeArr[0].onError.mock.calls.length).toBe(1);
  expect(nodeArr[0].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[1].onError.mock.calls.length).toBe(1);
  expect(nodeArr[1].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[2].onError.mock.calls.length).toBe(1);
  expect(nodeArr[2].onError.mock.calls[0][0]).toBeInstanceOf(DependencyNotMeetError);
})