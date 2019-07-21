import {Controlled as CodeMirror} from 'react-codemirror2'
import PropTypes from 'prop-types';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neo.css';
import 'codemirror/addon/display/placeholder';
import './CmInput.less';

const options = {
  mode: 'javascript',
  theme: 'neo',
  lineNumbers: false,
  viewportMargin: Infinity,
};

function CmInput({ value, placeholder, onChange }) {
  options.placeholder = placeholder;
  return (
    <CodeMirror
      value={value}
      options={options}
      onChange={(editor, data, value) => {
        if (onChange) {
          onChange(value);
        }
      }}
    />
  )
}

CmInput.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
}

export default CmInput;