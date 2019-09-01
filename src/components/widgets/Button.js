import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './Button.less';
import { 
  Collapse,
  Button as AntButton,
} from "antd";
import Config from './Config';

const BUTTON_ACTION_OPTION_MAP = {
  TriggerAnAction: '触发 Action',    // doing
  OpenAnyWebPage: '打开任意网页',     // done
  // BETTER(feature) TODO(ruitao.xu): low priority
  // OpenAnotherLocalPage: '打开本站其他页面',
}

const actionOptions = Object.values(BUTTON_ACTION_OPTION_MAP);
const defaultAction = BUTTON_ACTION_OPTION_MAP.TriggerAnAction;

function Button({ text, color, actionType, actionOpenAnyWebPage }) {
  const style = {
    backgroundColor: color,
    borderColor: color,
  }

  // WARNING(ruitao.xu): never use `href` and `target` props
  // If `href` is used, <AntButton> will rendered as <a> instread of <button>,
  // which leads to unnecessary css issues
  const props = {}
  switch (actionType) {
    case BUTTON_ACTION_OPTION_MAP.TriggerAnAction:
      // throw new Error(`not yet implemented action type: ${actionType}`);
      break;
    case BUTTON_ACTION_OPTION_MAP.OpenAnyWebPage:
      props.onClick = () => {
        if (actionOpenAnyWebPage.isOpenInNewTab) {
          window.open(actionOpenAnyWebPage.href);
        } else {
          window.location.href = actionOpenAnyWebPage.href;
        }
      }
      break;

    default:
      throw new Error(`when buildButtonProps: unexpected action type: ${actionType}`);
  }
  
  return (
    <div className={styles.widgetButton} >
      <AntButton type='primary' style={style} {...props} >
        {text}
      </AntButton>
    </div>
  );
}

function TriggerAnActionConfigPanel({}) {
  // TODO(ruitao.xu): load already exist action
  const options = ['新建 Action'];

  // TODO(ruitao.xu): load action and redirect focus to ActionEditor
  function onChange(value) {
    console.log('in TriggerAnActionConfigPanel(), selected: ', value);
  }

  return (
    <Config.LabelSelect
      select={{
        placeholder: '选择 Action',
        options: options,
        onChange: onChange,
      }}
    />
  );
}

TriggerAnActionConfigPanel.propTypes = {
}
TriggerAnActionConfigPanel.defaultProps = {
}

function OpenAnotherLocalPageConfigPanel({ isOpenInNewTab }) {
  // BETTER TODO(ruitao.xu): load already exist page
  const options = ['placeholder #1', 'placeholder #2'];

  // BETTER TODO(ruitao.xu): 
  function onChange(value) {
    console.log('in OpenAnotherLocalPageConfigPanel::onChange, selected: ', value);
  }
  function onIsOpenInNewTabChange(checked) {
    console.log('in OpenAnotherLocalPageConfigPanel::onIsOpenInNewTabChange, checked: ', checked);
  }

  return (
    <>
      <Config.LabelSelect
        label={{ value: '本站页面' }}
        select={{
          options: options,
          onChange: onChange,
        }}
      />
      <Config.Switch 
        checked={isOpenInNewTab} 
        onChange={onIsOpenInNewTabChange}
        description='是否在新标签页打开' 
      />
    </>
  );
}

OpenAnotherLocalPageConfigPanel.propTypes = {
  isOpenInNewTab: PropTypes.bool,
}
OpenAnotherLocalPageConfigPanel.defaultProps = {
  isOpenInNewTab: false,
}

function OpenAnyWebPageConfigPanel({ isOpenInNewTab, href, dispatch }) {
  // TODO(ruitao.xu): 
  function onHrefChange(e) {
    const newHref = e.target.value;
    console.log('in OpenAnyWebPageConfigPanel::onHrefChange, new: ', newHref);
    dispatch({
      type: ACTION_TYPE.OPEN_ANY_WEB_PAGE.SET_HREF,
      payload: newHref,
    });
  }
  function onIsOpenInNewTabChange(checked) {
    console.log('in OpenAnyWebPageConfigPanel::onIsOpenInNewTabChange, checked: ', checked);
    dispatch({
      type: ACTION_TYPE.OPEN_ANY_WEB_PAGE.SET_IS_OPEN_IN_NEW_TAB,
      payload: checked,
    });
  }

  return (
    <>
      <Config.LabelInput
        label={{ value: 'URL' }}
        input={{
          placeholder: 'https://example.com?param1=value1',
          value: href,
          onChange: onHrefChange,
        }}
      />
      <Config.Switch 
        checked={isOpenInNewTab} 
        onChange={onIsOpenInNewTabChange}
        description='是否在新标签页打开' 
      />
    </>
  );
}

OpenAnyWebPageConfigPanel.propTypes = {
  isOpenInNewTab: PropTypes.bool,
  href: PropTypes.string,
}
OpenAnyWebPageConfigPanel.defaultProps = {
  isOpenInNewTab: false,
}

Button.propTypes = {
  text: PropTypes.string.isRequired,
  color: PropTypes.string,
  actionType: PropTypes.oneOf(actionOptions),
  actionTriggerAnAction: PropTypes.shape(TriggerAnActionConfigPanel.propTypes),
  actionOpenAnyWebPage: PropTypes.shape(OpenAnyWebPageConfigPanel.propTypes),
}
Button.defaultProps = {
  text: '提交',
  color: '#1EA9FB',
  actionType: defaultAction,
  actionTriggerAnAction: TriggerAnActionConfigPanel.defaultProps,
  actionOpenAnyWebPage: OpenAnyWebPageConfigPanel.defaultProps,
}
Button.export = (props) => {
  return {
    text: props.text,
  }
}

const initialState = Button.defaultProps;
const ACTION_TYPE = {
  SET_TEXT: 'setText',
  SET_COLOR: 'setColor',
  SET_ACTION_TYPE: 'setActionType',

  OPEN_ANY_WEB_PAGE: {
    SET_HREF: 'openAnyWebPage.setHref',
    SET_IS_OPEN_IN_NEW_TAB: 'OpenAnyWebPage.setIsOpenInNewTab',
  },
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
    case ACTION_TYPE.OPEN_ANY_WEB_PAGE.SET_HREF:
      return {
        ...prevState,
        actionOpenAnyWebPage: {
          ...prevState.actionOpenAnyWebPage,
          href: action.payload,
        },
      }
    case ACTION_TYPE.OPEN_ANY_WEB_PAGE.SET_IS_OPEN_IN_NEW_TAB:
      return {
        ...prevState,
        actionOpenAnyWebPage: {
          ...prevState.actionOpenAnyWebPage,
          isOpenInNewTab: action.payload,
        },
      }

    default:
      throw new Error(`in ButtonWidget reducer(): unexpected action type: ${action.type}`);
  }
}


function ConfigPanel({ text, color, dispatch, actionType, actionOpenAnyWebPage }) {
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
      <Panel header='Action' key='2' >
        <Config.LabelSelect
          label={{ value: '点击时(onClick)' }}
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
