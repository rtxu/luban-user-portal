import { Collapse, } from "antd";

import Config from '../Config';
import { setLabel, setLabelMaxWidth, setInputValue, setInputPlaceholder, setInputType } from './reducer';

function ConfigPanel({ label, labelMaxWidth, input, dispatch }) {
  const { Panel } = Collapse;

  const inputTypes = [
    'text', 'password', 'color', 
    'date', 'datetime-local', 'email',
    'month', 'number', 'range', 
    'search', 'tel', 'time', 'url', 
    'week',
  ];

  return (
    <Collapse
      defaultActiveKey={['1', '2']}
      expandIconPosition='right'
    >
      <Panel header='基础配置' key='1' >
        <Config.LabelInput
          label={{ value: '字段名' }}
          input={{
            value: label,
            onChange: (e) => dispatch(setLabel(e.target.value)),
          }}
        />
        <Config.LabelSelect 
          label={{ value: '输入框类型' }}
          select={{
            defaultValue: 'text',
            options: inputTypes,
            onChange: (newInputType) => dispatch(setInputType(newInputType)),
          }}
        />
        {/*  暂时没有想到应用场景
        <Config.LabelInput
          label={{ value: '初始值' }}
          input={{
            value: input.value,
            onChange: (e) => dispatch(setInputValue(e.target.value)),
          }}
        />
        */}
      </Panel>
      <Panel header='显示选项' key='2' >
        <Config.LabelInput
          label={{ value: '占位文本' }}
          input={{
            value: input.placeholder,
            onChange: (e) => dispatch(setInputPlaceholder(e.target.value)),
          }}
        />
        <Config.LabelInput
          label={{ value: '字段名最大宽度' }}
          input={{
            type: 'number',
            value: String(labelMaxWidth),
            placeholder: '默认值 150',
            onChange: (e) => dispatch(setLabelMaxWidth(Number(e.target.value))),
          }}
        />
      </Panel>
    </Collapse>
  );
}

export default ConfigPanel;