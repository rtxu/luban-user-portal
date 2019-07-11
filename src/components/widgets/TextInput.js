import PropTypes from 'prop-types';
import styles from './TextInput.less';
import { 
  Collapse,
  Input,
} from "antd";
import Config from './Config';

function TextInput({ label, placeholder }) {
  const classNames = [styles.widgetTextInput]
  return (
    <div className={classNames.join(' ')}>
      <label>{label}</label>
      <Input placeholder={placeholder} />
    </div>
  );
}

TextInput.propTypes = {
  label: PropTypes.string.isRequired,
  placeholder: PropTypes.string,
};

TextInput.defaultProps = {
  label: '这里有个输入框',
};

const initialState = TextInput.defaultProps;
const ACTION_TYPE = {
}
function reducer(prevState, action) {
  switch (action.type) {
    default:
      throw new Error(`in TextInputWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({ label, defaultValue }) {
  // TODO(ruitao.xu):
  function onLabelChange(e) {
  }
  function onDefaultValueChange(e) {
  }


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
            onChange: onLabelChange,
          }}
        />
        <Config.LabelSelect 
          label={{ value: '输入框类型' }}
          select={{
            defaultValue: 'text',
            options: inputTypes,
          }}
        />
        <Config.LabelInput
          label={{ value: '默认值' }}
          input={{
            value: defaultValue,
            onChange: onDefaultValueChange,
          }}
        />
      </Panel>
      <Panel header='显示选项' key='2' >
        {/*
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
        */}
      </Panel>
    </Collapse>
  );
}

ConfigPanel.propTypes = {
  ...TextInput.PropTypes,
  dispatch: PropTypes.func.isRequired,
}
TextInput.ConfigPanel = ConfigPanel;
TextInput.initialState = initialState;
TextInput.reducer = reducer;

export default TextInput;
