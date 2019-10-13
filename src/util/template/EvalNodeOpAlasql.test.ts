import alasql from 'alasql';

import EvalNode, { EvalNodeTypeEnum } from './EvalNode';
import Op from './EvalNodeOpAlasql';

test('listPossibleDepId', () => {
  const node = new EvalNode('id', EvalNodeTypeEnum.Alasql, 'input');
  const deps = Op.listPossibleDepId(node);
  expect(deps.length).toBe(0);
})

test('run sql', async () => {
  const data = await alasql.promise('select * from ? where id = ?', 
    [[{id: 'id1', text: 'text1'}, {id: 'id2', text: 'text2'}], 'id1']);
  expect(data).toEqual([{id: 'id1', text: 'text1'}]);
})

test('evaluate', async () => {
  const mockOnEval = jest.fn();
  const sqlNode = new EvalNode(
    'op1.data', 
    EvalNodeTypeEnum.Alasql, 
    'select * from ? where id = ?',
    mockOnEval,
  );
  const param0 = new EvalNode('op1.data.param.0', EvalNodeTypeEnum.Default, '');
  param0.setEvaluated([{id: 'id1', text: 'text1'}, {id: 'id2', text: 'text2'}]);
  const param1 = new EvalNode('op1.data.param.1', EvalNodeTypeEnum.Default, '');
  param1.setEvaluated('id1');
  sqlNode.addDependency({
    [param0.id]: param0,
    [param1.id]: param1,
  });
  const ctx = {};
  await Op.evaluate(sqlNode, ctx);

  expect(mockOnEval.mock.calls.length).toBe(1);
  const [valueIndex, extraIndex, errorIndex] = [0, 1, 2];
  expect(mockOnEval.mock.calls[0][valueIndex]).toEqual([{id: 'id1', text: 'text1'}]);
  expect(mockOnEval.mock.calls[0][extraIndex]).toEqual({
    preparedSql: 'select * from ? where id = ?',
    params: [
      [{id: 'id1', text: 'text1'}, {id: 'id2', text: 'text2'}],
      'id1',
    ],
  });
  expect(mockOnEval.mock.calls[0][errorIndex]).toBeNull();
})