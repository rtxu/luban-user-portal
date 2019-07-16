import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './Button.less';
import { 
  Collapse,
  Button as AntButton,
} from "antd";
import Config from './Config';

function Button({ text, color }) {
  const style = {
    backgroundColor: color,
    borderColor: color,
  }
  
  return (
    <div className={styles.widgetButton}>
      <AntButton type='primary' style={style}>
        {text}
      </AntButton>
    </div>
  );
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  actionType: PropTypes.string,
};

const BUTTON_ACTION_OPTION_MAP = {
  TriggerAnAction: '触发一个动作',
  OpenAnotherLocalPage: '打开本站其他页面',
  OpenAnyWebPage: '打开任意网页',
}

const actionOptions = Object.values(BUTTON_ACTION_OPTION_MAP);
const defaultAction = BUTTON_ACTION_OPTION_MAP.TriggerAnAction;
Button.defaultProps = {
  text: '提交',
  color: '#1EA9FB',
  actionType: defaultAction,
};

const initialState = Button.defaultProps;
const ACTION_TYPE = {
  SET_TEXT: 'setText',
  SET_COLOR: 'setColor',
  SET_ACTION_TYPE: 'setActionType',
}
function reducer(prevState, action) {
  switch (action.type) {
    case ACTION_TYPE.SET_TEXT:
      return {
        ...prevState,
        text: action.payload,
      }
    case ACTION_TYPE.SET_COLOR:
      return {
        ...prevState,
        color: action.payload,
      }
    case ACTION_TYPE.SET_ACTION_TYPE:
      return {
        ...prevState,
        actionType: action.payload,
      }

    default:
      throw new Error(`in ButtonWidget reducer(): unexpected action type: ${action.type}`);
  }
}

// TODO(ruitao.xu): begin
function TriggerAnActionConfigPanel({ text, color, dispatch, actionType }) {
  return (
    <Config.LabelSelect
      select={{
        defaultValue: actionType,
        options: actionOptions,
      }}
    />
  );
}

function OpenAnotherLocalPageConfigPanel({ text, color, dispatch, actionType }) {
  return (
    <Config.LabelSelect
      select={{
        defaultValue: actionType,
        options: actionOptions,
      }}
    />
  );
}

function OpenAnyWebPageConfigPanel({ text, color, dispatch, actionType }) {
  return (
    <Config.LabelSelect
      select={{
        defaultValue: actionType,
        options: actionOptions,
      }}
    />
  );
}
// TODO(ruitao.xu): end

function ConfigPanel({ text, color, dispatch, actionType }) {
  function onTextChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_TEXT,
      payload: e.target.value,
    });
  }
  function onColorChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_COLOR,
      payload: e.target.value,
    });
  }
  function onActionTypeChange(newActionType) {
    dispatch({
      type: ACTION_TYPE.SET_ACTION_TYPE,
      payload: newActionType,
    });
  }

  const { Panel } = Collapse;
  function buildActionBodyConfigNode(actionType) {
    switch (actionType) {
      case BUTTON_ACTION_OPTION_MAP.TriggerAnAction:
        return <TriggerAnActionConfigPanel />;
      case BUTTON_ACTION_OPTION_MAP.OpenAnotherLocalPage:
        return <OpenAnotherLocalPageConfigPanel />;
      case BUTTON_ACTION_OPTION_MAP.OpenAnyWebPage:
        return <OpenAnyWebPageConfigPanel />;

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
            onChange: onTextChange,
          }}
        />
        <Config.LabelInput
          label={{ value: '按钮颜色' }}
          input={{
            type: 'color',
            value: color,
            onChange: onColorChange,
          }}
        />
      </Panel>
      <Panel header='动作' key='2' >
        <Config.LabelSelect
          label={{ value: '点击时触发(onClick)' }}
          select={{
            defaultValue: actionType,
            options: actionOptions,
            onChange: onActionTypeChange,
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

ConfigPanel.propTypes = {
  ...Button.propTypes,
  dispatch: PropTypes.func.isRequired,
}
ConfigPanel.defaultProps = Button.defaultProps
Button.ConfigPanel = ConfigPanel;
Button.initialState = initialState;
Button.reducer = reducer;

Button.use = () => {
  const [widgetProps, widgetDispatch] = useReducer(Button.reducer, Button.initialState);
  return ([<Button {...widgetProps} />, 
    widgetProps, 
  <Button.ConfigPanel dispatch={widgetDispatch} {...widgetProps} />]);
}

export default Button;
