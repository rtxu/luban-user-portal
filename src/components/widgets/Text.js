import PropTypes from 'prop-types';
import styles from './Text.less';
import { Input, Switch } from "antd";

function Text({ value, isScrollWhenOverflow, isExpandWhenHover }) {
  const classNames = [styles.widgetText]
  if (isScrollWhenOverflow) {
    classNames.push(styles.scroll);
  } else if (isExpandWhenHover) {
    classNames.push(styles.scrollWithHoverExpand);
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
}
function reducer(prevState, action) {
  switch (action.type) {
    case ACTION_TYPE.SET_IS_SCROLL_WHEN_OVERFLOW:
      return {
        ...prevState,
        isScrollWhenOverflow: action.payloud,
      }
    case ACTION_TYPE.SET_IS_EXPAND_WHEN_HOVER:
      return {
        ...prevState,
        isExpandWhenHover: action.payloud,
      }
    default:
      throw new Error(`in TextWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({value, isScrollWhenOverflow, isExpandWhenHover, dispatch}) {
  function onIsScrollChange(checked) {
    dispatch({
      type: ACTION_TYPE.SET_IS_SCROLL_WHEN_OVERFLOW,
      payloud: checked,
    });
  }
  function onIsExpandChange(checked) {
    dispatch({
      type: ACTION_TYPE.SET_IS_EXPAND_WHEN_HOVER,
      payloud: checked,
    });
  }
  return (
    <>
      <label>文本</label>
      <Input placeholder={value}></Input>
      <Switch onChange={onIsScrollChange} />
      <p>当文本内容溢出时，是否显示滚动条</p>
      <Switch onChange={onIsExpandChange} />
      <p>当鼠标悬停文本上方时，是否显示全文</p>
    </>
  );
}

ConfigPanel.propTypes = {
  ...Text.PropTypes,
  dispatch: PropTypes.func.isRequired,
}
Text.ConfigPanel = ConfigPanel;
Text.initialState = initialState;
Text.reducer = reducer;

export default Text;
