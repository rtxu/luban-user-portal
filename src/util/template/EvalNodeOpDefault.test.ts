import EvalNode, { EvalNodeTypeEnum } from "./EvalNode";
import Op from "./EvalNodeOpDefault";

test("listPossibleDepId", () => {
  const node = new EvalNode(
    "widget1.value",
    EvalNodeTypeEnum.Default,
    " {{a.b.c}} {{aa.bb.cc}} {{aaa.b.ccc}}"
  );
  const deps = Op.listPossibleDepId(node);
  expect(deps).toContain("a.b.c");
  expect(deps).toContain("aa.bb.cc");
  expect(deps).toContain("aaa.b.ccc");
});

test("error happened when evaluate", () => {
  const testEvaluateError = (input, expectedErrorType) => {
    const mockOnEval = jest.fn();
    const node = new EvalNode(
      "widget1.value",
      EvalNodeTypeEnum.Default,
      input,
      mockOnEval
    );
    Op.evaluate(node, {});
    expect(mockOnEval.mock.calls.length).toBe(1);
    expect(mockOnEval.mock.calls[0][2]).toBeInstanceOf(expectedErrorType);
  };
  testEvaluateError("{{ reference_error }}", ReferenceError);
  testEvaluateError("{{  }}", SyntaxError);
});

const testEvaluate = (input, expectedValue, ctx?, deps?) => {
  const node = new EvalNode("widget1.value", EvalNodeTypeEnum.Default, input);
  if (deps) {
    node.addDependency(deps);
  }
  Op.evaluate(node, ctx);
  expect(node.value).toEqual(expectedValue);
};
test("evaluate literal", () => {
  testEvaluate("this is a literal", "this is a literal");
});
test("execute js code", () => {
  testEvaluate("1+1 = {{1+1}}", "1+1 = 2");
});
test("evaluate expression", () => {
  testEvaluate("{{ undefined }}", undefined);
  testEvaluate("{{ null }}", null);
  testEvaluate("{{ 5 }}", 5);
  testEvaluate('{{ "str" }}', "str");
  testEvaluate("{{ [1, 2, 3] }}", [1, 2, 3]);
  testEvaluate("{{ [a, b, c] }}", [1, 2, 3], { a: 1, b: 2, c: 3 });
});
test("evaluate template_string", () => {
  testEvaluate("hello, {{name}}", "hello, world", { name: "world" });

  const depNode = new EvalNode(
    "textinput1.value",
    EvalNodeTypeEnum.Default,
    ""
  );
  depNode.setEvaluated("world");
  const deps = {
    [depNode.id]: depNode
  };
  testEvaluate("hello, {{textinput1.value}}", "hello, world", {}, deps);
});
