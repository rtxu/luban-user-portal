import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './Text.less';
import { 
  Collapse,
} from "antd";
import Config from './Config';

function Text({ value, isScrollWhenOverflow, isExpandWhenHover }) {
  const classNames = [styles.widgetText]
  if (isScrollWhenOverflow) {
    classNames.push(styles.scroll);
    if (isExpandWhenHover) {
      classNames.push(styles.hover);
    }
  } 
  return (
    <div className={classNames.join(' ')}>
      <p>{value}</p>
    </div>
  );
}

Text.propTypes = {
  value: PropTypes.string.isRequired,
  isScrollWhenOverflow: PropTypes.bool,
  isExpandWhenHover: PropTypes.bool,
};

Text.defaultProps = {
  value: '这里填被展示的文本 😃',
  isScrollWhenOverflow: false,
  isExpandWhenHover: false,
};

const initialState = Text.defaultProps;
const ACTION_TYPE = {
  SET_IS_SCROLL_WHEN_OVERFLOW: 'setIsScrollWhenOverflow',
  SET_IS_EXPAND_WHEN_HOVER: 'setIsExpandWhenHover',
  SET_VALUE: 'setValue',
}
function reducer(prevState, action) {
  switch (action.type) {
    case ACTION_TYPE.SET_IS_SCROLL_WHEN_OVERFLOW:
      return {
        ...prevState,
        isScrollWhenOverflow: action.payload,
      }
    case ACTION_TYPE.SET_IS_EXPAND_WHEN_HOVER:
      return {
        ...prevState,
        isExpandWhenHover: action.payload,
      }
    case ACTION_TYPE.SET_VALUE:
      return {
        ...prevState,
        value: action.payload,
      }
    default:
      throw new Error(`in TextWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({value, isScrollWhenOverflow, isExpandWhenHover, dispatch}) {
  function onIsScrollChange(checked) {
    dispatch({
      type: ACTION_TYPE.SET_IS_SCROLL_WHEN_OVERFLOW,
      payload: checked,
    });
  }
  function onIsExpandChange(checked) {
    dispatch({
      type: ACTION_TYPE.SET_IS_EXPAND_WHEN_HOVER,
      payload: checked,
    });
  }
  // better to debounce
  function onTextChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_VALUE,
      payload: e.target.value,
    });
  }

  const { Panel } = Collapse;

  return (
    <Collapse
      defaultActiveKey={['1', '2']}
      expandIconPosition='right'
    >
      <Panel header='内容' key='1' >
        <Config.LabelInput
          label={{ value:'文本' }}
          input={{ value: value, onChange: onTextChange, }}
        />
      </Panel>
      <Panel header='显示选项' key='2' >
        <Config.Switch 
          checked={isScrollWhenOverflow} 
          onChange={onIsScrollChange}
          description='当文本内容溢出时，是否显示滚动条' 
        />
        <Config.Switch 
          checked={isExpandWhenHover} 
          disabled={!isScrollWhenOverflow}
          onChange={onIsExpandChange}
          description='当鼠标悬停文本上方时，是否显示全文'
        />
      </Panel>
    </Collapse>
  );
}

ConfigPanel.propTypes = {
  ...Text.PropTypes,
  dispatch: PropTypes.func.isRequired,
}
Text.ConfigPanel = ConfigPanel;
Text.initialState = initialState;
Text.reducer = reducer;
Text.exporter = (props) => {
  return {
    value: props.value,
  }
}


Text.use = () => {
  const [widgetProps, widgetDispatch] = useReducer(Text.reducer, Text.initialState);
  return ([<Text {...widgetProps} />, 
    widgetProps, 
  <Text.ConfigPanel dispatch={widgetDispatch} {...widgetProps} />]);
}

export default Text;
