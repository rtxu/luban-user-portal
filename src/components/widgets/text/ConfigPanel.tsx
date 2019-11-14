import { Collapse } from "antd";
import React from "react";

import { toEvalResult } from "../common";
import Config from "../Config";
import {
  setIsExpandWhenHover,
  setIsScrollWhenOverflow,
  setValueTemplateInput
} from "./reducer";

function ConfigPanel({
  valueInput,
  value,
  valueError,
  isScrollWhenOverflow,
  isExpandWhenHover,
  dispatch
}) {
  function onIsScrollChange(checked) {
    dispatch(setIsScrollWhenOverflow(checked));
  }
  function onIsExpandChange(checked) {
    dispatch(setIsExpandWhenHover(checked));
  }
  // better to debounce
  function onTextChange(newValue) {
    dispatch(setValueTemplateInput(newValue));
  }

  const { Panel } = Collapse;

  return (
    <Collapse defaultActiveKey={["1", "2"]} expandIconPosition="right">
      <Panel header="内容" key="1">
        <Config.LabelCmEvalInput
          label={{ value: "文本" }}
          input={{
            value: valueInput,
            evalResult: toEvalResult(value, valueError),
            onChange: onTextChange
          }}
        />
      </Panel>
      <Panel header="显示选项" key="2">
        <Config.Switch
          checked={isScrollWhenOverflow}
          onChange={onIsScrollChange}
          description="当文本内容溢出时，是否显示滚动条"
        />
        <Config.Switch
          checked={isExpandWhenHover}
          disabled={!isScrollWhenOverflow}
          onChange={onIsExpandChange}
          description="当鼠标悬停文本上方时，是否显示全文"
        />
      </Panel>
    </Collapse>
  );
}

export default ConfigPanel;
