import PropTypes from 'prop-types';
import styles from './TextInput.less';
import { 
  Collapse,
  Input,
} from "antd";
import Config from './Config';

// TODO(ruitao.xu): support different display mode
// [done] one-line mode: <label> <input>
// two-line mode: <label>\n <input>
// multi-line mode: <label>\n <textarea>
function TextInput({ label, labelMaxWidth, input }) {
  const labelStyle = {
    maxWidth: labelMaxWidth,
  }
  return (
    <div className={styles.widgetTextInput}>
      { label && <label style={labelStyle}>{label}</label> }
      <Input 
        type={input.type}
        placeholder={input.placeholder} 
        value={input.value} 
      />
    </div>
  );
}

TextInput.propTypes = {
  label: PropTypes.string,
  labelMaxWidth: PropTypes.number,
  input: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    // defaultValue: PropTypes.string,
    // onChange: PropTypes.func,
    // onPressEnter: PropTypes.func,
  }),
};

TextInput.defaultProps = {
  label: '字段名',
  labelMaxWidth: 150,
  input: {
    type: 'text',
  }
};

const initialState = TextInput.defaultProps;
const ACTION_TYPE = {
  SET_LABEL: 'setLabel',
  SET_LABEL_MAX_WIDTH: 'setLabelMaxWidth',
  SET_INPUT_VALUE: 'setInputValue',
  SET_INPUT_PLACEHOLDER: 'setInputPlaceholder',
}
function reducer(prevState, action) {
  switch (action.type) {
    case ACTION_TYPE.SET_LABEL:
      return {
        ...prevState,
        label: action.payload,
      }
    case ACTION_TYPE.SET_LABEL_MAX_WIDTH:
      return {
        ...prevState,
        labelMaxWidth: action.payload,
      }
    case ACTION_TYPE.SET_INPUT_VALUE:
      return {
        ...prevState,
        input: {
          ...prevState.input,
          value: action.payload,
        }
      }
    case ACTION_TYPE.SET_INPUT_PLACEHOLDER:
      return {
        ...prevState,
        input: {
          ...prevState.input,
          placeholder: action.payload,
        }
      }
    
    default:
      throw new Error(`in TextInputWidget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({ label, labelMaxWidth, input, dispatch }) {
  function onLabelChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_LABEL,
      payload: e.target.value,
    });
  }
  function onLabelMaxWidthChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_LABEL_MAX_WIDTH,
      payload: e.target.value,
    });
  }
  function onInputValueChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_INPUT_VALUE,
      payload: e.target.value,
    });
  }
  function onInputPlaceholderChange(e) {
    dispatch({
      type: ACTION_TYPE.SET_INPUT_PLACEHOLDER,
      payload: e.target.value,
    });
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
          label={{ value: '初始值' }}
          input={{
            value: input.value,
            onChange: onInputValueChange,
          }}
        />
      </Panel>
      <Panel header='显示选项' key='2' >
        <Config.LabelInput
          label={{ value: '占位文本' }}
          input={{
            value: input.placeholder,
            onChange: onInputPlaceholderChange,
          }}
        />
        <Config.LabelInput
          label={{ value: '字段名最大宽度' }}
          input={{
            type: 'number',
            value: labelMaxWidth,
            placeholder: '默认值 150',
            onChange: onLabelMaxWidthChange,
          }}
        />
      </Panel>
    </Collapse>
  );
}

ConfigPanel.propTypes = {
  ...TextInput.propTypes,
  dispatch: PropTypes.func.isRequired,
}
TextInput.ConfigPanel = ConfigPanel;
TextInput.initialState = initialState;
TextInput.reducer = reducer;

export default TextInput;
