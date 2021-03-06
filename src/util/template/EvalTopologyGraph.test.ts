import { ITemplate, TemplateTypeEnum } from "./common";
import CyclicDependencyError from "./CyclicDependencyError";
import DependencyNotMeetError from "./DependencyNotMeetError";
import EvalTopologyGraph from "./EvalTopologyGraph_v2";

function expectMock(
  mock: jest.MockContext<any, any[]>,
  callCnt: number,
  callArgArray
) {
  expect(mock.calls.length).toBe(callCnt);
  for (let i = 0; i < callCnt; i++) {
    expect(mock.calls[i]).toEqual(callArgArray[i]);
  }
}

test("simple", () => {
  const mockOnEval = jest.fn();
  const templates: ITemplate[] = [];
  templates.push({
    id: "widget1.value",
    type: TemplateTypeEnum.Default,
    input: "literal template",
    onEval: mockOnEval
  });
  const graph = new EvalTopologyGraph(templates);
  graph.evaluate({});

  expectMock(mockOnEval.mock, 1, [["literal template", null, null]]);
});

test("no_cyclic_dependency", () => {
  const mockOnEval = jest.fn();
  const templates: ITemplate[] = [];
  templates.push({
    id: "widget0.value",
    type: TemplateTypeEnum.Default,
    input: "literal template",
    onEval: mockOnEval
  });
  templates.push({
    id: "widget1.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget0.value}}",
    onEval: mockOnEval
  });
  const graph = new EvalTopologyGraph(templates);
  graph.evaluate({});

  expectMock(mockOnEval.mock, 2, [
    ["literal template", null, null],
    ["literal template", null, null]
  ]);
});

test("onError:CyclicDependencyError", () => {
  const mockOnEval = jest.fn();
  const templates: ITemplate[] = [];
  templates.push({
    id: "widget0.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget1.value}}",
    onEval: mockOnEval
  });
  templates.push({
    id: "widget1.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget0.value}}",
    onEval: mockOnEval
  });
  const graph = new EvalTopologyGraph(templates);
  graph.evaluate({});

  expect(mockOnEval.mock.calls.length).toBe(2);
  {
    const [value, extra, error] = mockOnEval.mock.calls[0];
    expect(value).toBeNull();
    expect(extra).toBeNull();
    expect(error).toBeInstanceOf(CyclicDependencyError);
  }
  {
    const [value, extra, error] = mockOnEval.mock.calls[1];
    expect(value).toBeNull();
    expect(extra).toBeNull();
    expect(error).toBeInstanceOf(CyclicDependencyError);
  }
});

test("onError:DependencyNotMeetError", () => {
  const mockOnEval = jest.fn();
  const templates: ITemplate[] = [];
  templates.push({
    id: "widget0.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget1.value}}",
    onEval: mockOnEval
  });
  templates.push({
    id: "widget1.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget0.value}}",
    onEval: mockOnEval
  });
  templates.push({
    id: "widget2.value",
    type: TemplateTypeEnum.Default,
    input: "{{widget0.value}}",
    onEval: mockOnEval
  });
  const graph = new EvalTopologyGraph(templates);
  graph.evaluate({});

  expect(mockOnEval.mock.calls.length).toBe(3);
  {
    const [value, extra, error] = mockOnEval.mock.calls[0];
    expect(value).toBeNull();
    expect(extra).toBeNull();
    expect(error).toBeInstanceOf(CyclicDependencyError);
  }
  {
    const [value, extra, error] = mockOnEval.mock.calls[1];
    expect(value).toBeNull();
    expect(extra).toBeNull();
    expect(error).toBeInstanceOf(CyclicDependencyError);
  }
  {
    const [value, extra, error] = mockOnEval.mock.calls[2];
    expect(value).toBeNull();
    expect(extra).toBeNull();
    expect(error).toBeInstanceOf(DependencyNotMeetError);
  }
});

test("sql basic", () => {
  const ctx = {
    op1: {
      data: [{ id: 1 }, { id: 2 }]
    }
  };
  const mockOnEval = jest.fn();
  const templates: ITemplate[] = [];
  templates.push({
    id: "op2",
    type: TemplateTypeEnum.Alasql,
    input: "select * from {{op1.data}}",
    onEval: mockOnEval
  });
  const graph = new EvalTopologyGraph(templates);
  graph.evaluate(ctx);

  expect(mockOnEval.mock.calls.length).toBe(1);
  {
    const [value, extra, error] = mockOnEval.mock.calls[0];
    expect(value).toEqual({
      sqlTemplate: "select * from ?",
      params: [ctx.op1.data]
    });
    expect(extra).toBeNull();
    expect(error).toBeNull();
  }
});
