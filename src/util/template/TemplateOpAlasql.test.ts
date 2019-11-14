import { IAlasqlTemplate, TemplateTypeEnum } from "./common";
import EvalNode, { EvalNodeTypeEnum } from "./EvalNode";
import AlasqlOp from "./TemplateOpAlasql";

test("buildEvalNodes", () => {
  const template: IAlasqlTemplate = {
    id: "op1.data",
    type: TemplateTypeEnum.Alasql,
    input: "select * from {{table1.data}} where id = {{textinput1.value}}",
    onEval: (value, error) => {}
  };
  const nodeList = AlasqlOp.buildEvalNodes(template);

  expect(nodeList.length).toBe(3);
  const sqlNode = nodeList[0];
  expect(sqlNode).toBeInstanceOf(EvalNode);
  expect(sqlNode.id).toBe("op1.data");
  expect(sqlNode.type).toBe(EvalNodeTypeEnum.Alasql);
  expect(sqlNode.input).toBe("select * from ? where id = ?");
  expect(sqlNode.isDependOn("op1.data.param.0")).toBeTruthy();
  expect(sqlNode.isDependOn("op1.data.param.1")).toBeTruthy();

  const params = nodeList.slice(1);
  expect(params[0]).toBeInstanceOf(EvalNode);
  expect(params[0].id).toBe("op1.data.param.0");
  expect(params[0].type).toBe(EvalNodeTypeEnum.Default);
  expect(params[0].input).toBe("{{table1.data}}");
  expect(params[1]).toBeInstanceOf(EvalNode);
  expect(params[1].id).toBe("op1.data.param.1");
  expect(params[1].type).toBe(EvalNodeTypeEnum.Default);
  expect(params[1].input).toBe("{{textinput1.value}}");
});
