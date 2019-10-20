import { Collapse } from "antd";

import Config from '../Config';
import { BUTTON_ACTION_OPTION_MAP, actionOptions } from './common';
import { setText, setColor, setActionType } from './reducer';
import TriggerAnActionConfigPanel from './TriggerAnActionConfigPanel';
import OpenAnotherLocalPageConfigPanel from './OpenAnotherLocalPageConfigPanel';
import OpenAnyWebPageConfigPanel from './OpenAnyWebPageConfigPanel';

function ConfigPanel({ text, color, dispatch, actionType, actionOpenAnyWebPage }) {

  const { Panel } = Collapse;

  function buildActionBodyConfigNode(actionType) {
    switch (actionType) {
      case BUTTON_ACTION_OPTION_MAP.TriggerAnAction:
        return <TriggerAnActionConfigPanel dispatch={dispatch} />;
      case BUTTON_ACTION_OPTION_MAP.OpenAnotherLocalPage:
        return <OpenAnotherLocalPageConfigPanel dispatch={dispatch} />;
      case BUTTON_ACTION_OPTION_MAP.OpenAnyWebPage:
        return <OpenAnyWebPageConfigPanel dispatch={dispatch} {...actionOpenAnyWebPage} />;

      default:
        throw new Error(`when buildActionBodyConfigNode(): unexpected action type: ${actionType}`);
    }
  }
  const actionBodyConfigNode = buildActionBodyConfigNode(actionType);

  return (
    <Collapse
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='right'
    >
      <Panel header='基础配置' key='1' >
        <Config.LabelInput
          label={{ value: '文本' }}
          input={{
            value: text,
            onChange: (e) => {
              dispatch(setText(e.target.value));
            },
          }}
        />
        <Config.LabelInput
          label={{ value: '按钮颜色' }}
          input={{
            type: 'color',
            value: color,
            onChange: (e) => {
              dispatch(setColor(e.target.value));
            },
          }}
        />
      </Panel>
      <Panel header='行为' key='2' >
        <Config.LabelSelect
          label={{ value: '点击时(onClick)' }}
          select={{
            defaultValue: actionType,
            options: actionOptions,
            onChange: (newActionType) => {
              dispatch(setActionType(newActionType));
            },
          }}
        />
        {actionBodyConfigNode}
      </Panel>
      {/* // TODO(ruitao.xu): */}
      <Panel header='显示选项' key='3' >
      </Panel>
    </Collapse>
  );
}

export default ConfigPanel;