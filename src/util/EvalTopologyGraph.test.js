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

test('simple', () => {
  console.log('=== test: simple ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget1.value', 'literal template', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);
  graph.evaluate();

  expect(nodeArr[0].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[0].onEvaluated.mock.calls[0][0]).toBe('literal template');
})

test('no_cyclic_dependency', () => {
  console.log('=== test: no_cycic_dependency ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', 'literal template', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget1.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);
  graph.evaluate();

  expect(nodeArr[0].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[0].onEvaluated.mock.calls[0][0]).toBe('literal template');
  expect(nodeArr[1].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[1].onEvaluated.mock.calls[0][0]).toBe('literal template');
})

test('onError:CyclicDependencyError', () => {
  console.log('=== test: onError:CyclicDependencyError ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', '{{widget1.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget1.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);
  graph.evaluate();

  expect(nodeArr[0].onError.mock.calls.length).toBe(1);
  expect(nodeArr[0].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[1].onError.mock.calls.length).toBe(1);
  expect(nodeArr[1].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
})

test('onError:DependencyNotMeetError', () => {
  console.log('=== test: onError:DependencyNotMeetError ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', '{{widget1.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget1.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
    new EvalNode('widget2.value', '{{widget0.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);
  graph.evaluate();

  expect(nodeArr[0].onError.mock.calls.length).toBe(1);
  expect(nodeArr[0].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[1].onError.mock.calls.length).toBe(1);
  expect(nodeArr[1].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[2].onError.mock.calls.length).toBe(1);
  expect(nodeArr[2].onError.mock.calls[0][0]).toBeInstanceOf(DependencyNotMeetError);
})

test('onError:ReferenceError', () => {
  console.log('=== test: onError:ReferenceError ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', '{{widget1.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);
  graph.evaluate();

  expect(nodeArr[0].onError.mock.calls.length).toBe(1);
  expect(nodeArr[0].onError.mock.calls[0][0]).toBeInstanceOf(ReferenceError);
})

test('modify EvalTopologyGraph at runtime', () => {
  console.log('=== test: runtime modify ===')
  let i = 0;
  const nodeArr = [
    new EvalNode('widget0.value', 'literal', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]),
  ]
  const graph = new EvalTopologyGraph(nodeArr);
  graph.evaluate();
  expect(nodeArr[0].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[0].onEvaluated.mock.calls[0][0]).toBe('literal');

  // add a literal node
  nodeArr.push(new EvalNode('widget1.value', 'literal', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]))
  graph.addEvalNode(nodeArr[1]);
  graph.evaluate();
  expect(nodeArr[1].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[1].onEvaluated.mock.calls[0][0]).toBe('literal');

  // add a node wich depend on the existing node
  nodeArr.push(new EvalNode('widget2.value', '{{widget0.value}} + {{widget1.value}}', mockOnPendingArr[i], mockOnEvaluatedArr[i], mockOnErrorArr[i++]))
  graph.addEvalNode(nodeArr[2]);
  graph.evaluate();
  expect(nodeArr[2].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[2].onEvaluated.mock.calls[0][0]).toBe('literal + literal');

  // update node0
  nodeArr[0].onEvaluated.mockClear();
  graph.updateEvalNode(nodeArr[0].id, '{{widget1.value}} + widget0');
  graph.evaluate();
  expect(nodeArr[0].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[0].onEvaluated.mock.calls[0][0]).toBe('literal + widget0');

  // update node1, cyclic dependency
  nodeArr[0].onEvaluated.mockClear();
  nodeArr[1].onEvaluated.mockClear();
  nodeArr[2].onEvaluated.mockClear();
  graph.updateEvalNode(nodeArr[1].id, '{{widget0.value}} + widget1');
  graph.evaluate();
  expect(nodeArr[0].onError.mock.calls.length).toBe(1);
  expect(nodeArr[0].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[1].onError.mock.calls.length).toBe(1);
  expect(nodeArr[1].onError.mock.calls[0][0]).toBeInstanceOf(CyclicDependencyError);
  expect(nodeArr[2].onError.mock.calls.length).toBe(1);
  expect(nodeArr[2].onError.mock.calls[0][0]).toBeInstanceOf(DependencyNotMeetError);

  // remove widget0
  nodeArr[0].onError.mockClear();
  nodeArr[1].onError.mockClear();
  nodeArr[2].onError.mockClear();
  graph.removeEvalNode(nodeArr[0].id);
  graph.evaluate();
  expect(nodeArr[1].onError.mock.calls.length).toBe(1);
  expect(nodeArr[1].onError.mock.calls[0][0]).toBeInstanceOf(ReferenceError);
  expect(nodeArr[2].onError.mock.calls.length).toBe(1);
  expect(nodeArr[2].onError.mock.calls[0][0]).toBeInstanceOf(DependencyNotMeetError);

  // update widget1
  nodeArr[1].onEvaluated.mockClear();
  nodeArr[2].onEvaluated.mockClear();
  graph.updateEvalNode(nodeArr[1].id, 'literal');
  graph.updateEvalNode(nodeArr[2].id, '{{widget1.value}} + widget2');
  graph.evaluate();
  expect(nodeArr[1].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[1].onEvaluated.mock.calls[0][0]).toBe('literal');
  expect(nodeArr[2].onEvaluated.mock.calls.length).toBe(1);
  expect(nodeArr[2].onEvaluated.mock.calls[0][0]).toBe('literal + widget2');
})