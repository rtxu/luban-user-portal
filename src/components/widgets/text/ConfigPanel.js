import PropTypes from 'prop-types';
import { 
  Collapse,
} from "antd";
import Text from './Text';
import Config from '../Config';
import { setIsExpandWhenHover, setIsScrollWhenOverflow, setValue, } from './reducer';

function ConfigPanel({value, isScrollWhenOverflow, isExpandWhenHover, dispatch}) {
  function onIsScrollChange(checked) {
    dispatch(setIsScrollWhenOverflow(checked));
  }
  function onIsExpandChange(checked) {
    dispatch(setIsExpandWhenHover(checked));
  }
  // better to debounce
  function onTextChange(editor, data, newValue) {
    dispatch(setValue(newValue));
  }

  const { Panel } = Collapse;

  return (
    <Collapse
      defaultActiveKey={['1', '2']}
      expandIconPosition='right'
    >
      <Panel header='内容' key='1' >
        <Config.LabelCmInput
          label={{ value:'文本' }}
          input={{ 
            value: value, 
            evalResult: null,
            onBeforeChange: onTextChange, 
          }}
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

export default ConfigPanel;