import PropTypes from 'prop-types';
import { Input, } from "antd";

import styles from './TextInput.less';
import { setInputValue } from './reducer';

// BETTER(feature) TODO(ruitao.xu): support different display mode
// [done] one-line mode: <label> <input>
// two-line mode: <label>\n <input>
// multi-line mode: <label>\n <textarea>
function TextInput({ label, labelMaxWidth, input, dispatch }) {
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
        onChange={(e) => {
          dispatch(setInputValue(e.target.value));
        }}
        onKeyDown={(e) => {
          // disable DELETE propagation
          e.stopPropagation();
        }}
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
  dispatch: PropTypes.func.isRequired,
};

export default TextInput;