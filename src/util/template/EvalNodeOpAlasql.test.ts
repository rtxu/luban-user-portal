import EvalNode, { EvalNodeTypeEnum } from './EvalNode';
import Op from './EvalNodeOpAlasql';

test('listPossibleDepId', () => {
  const node = new EvalNode('id', EvalNodeTypeEnum.Alasql, 'input');
  const deps = Op.listPossibleDepId(node);
  expect(deps.length).toBe(0);
})

test('evaluate', () => {
  const mockOnEval = jest.fn();
  const sqlNode = new EvalNode(
    'op1.preparedSql', 
    EvalNodeTypeEnum.Alasql, 
    'select * from ? where id = ?',
    mockOnEval,
  );
  const param0 = new EvalNode('op1.preparedSql.param.0', EvalNodeTypeEnum.Default, '');
  param0.setEvaluated([{id: 'id1', text: 'text1'}, {id: 'id2', text: 'text2'}]);
  const param1 = new EvalNode('op1.preparedSql.param.1', EvalNodeTypeEnum.Default, '');
  param1.setEvaluated('id1');
  sqlNode.addDependency({
    [param0.id]: param0,
    [param1.id]: param1,
  });
  const ctx = {};
  Op.evaluate(sqlNode, ctx);

  expect(mockOnEval.mock.calls.length).toBe(1);
  const [valueIndex, extraIndex, errorIndex] = [0, 1, 2];
  expect(mockOnEval.mock.calls[0][valueIndex]).toEqual({
    sqlTemplate: 'select * from ? where id = ?',
    params: [
      [{id: 'id1', text: 'text1'}, {id: 'id2', text: 'text2'}],
      'id1',
    ],
  });
  expect(mockOnEval.mock.calls[0][extraIndex]).toBeNull();
  expect(mockOnEval.mock.calls[0][errorIndex]).toBeNull();
})