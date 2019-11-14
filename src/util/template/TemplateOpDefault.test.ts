import { IDefaultTemplate, TemplateTypeEnum } from "./common";
import EvalNode, { EvalNodeTypeEnum } from "./EvalNode";
import DefaultOp from "./TemplateOpDefault";

test("buildEvalNodes", () => {
  const template: IDefaultTemplate = {
    id: "widget1.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget2.value}}",
    onEval: (value, error) => {}
  };
  const nodeList = DefaultOp.buildEvalNodes(template);

  expect(nodeList.length).toBe(1);
  const node = nodeList[0];
  expect(node).toBeInstanceOf(EvalNode);
  expect(node.id).toBe("widget1.value");
  expect(node.type).toBe(EvalNodeTypeEnum.Default);
  expect(node.input).toBe("{{widget2.value}}");
});
