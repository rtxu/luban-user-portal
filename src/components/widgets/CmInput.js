import { UnControlled as CodeMirror } from 'react-codemirror2'
import PropTypes from 'prop-types';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neo.css';
import 'codemirror/addon/display/placeholder';
import styles from './CmInput.less';
import { Alert } from 'antd';

const options = {
  mode: 'javascript',
  theme: 'neo',
  lineWrapping: true,
  lineNumbers: false,
  viewportMargin: Infinity,
};

// BUG(ruitao.xu): CodeMirror 的 cursor 每次编辑后自动跳到文本末尾，打断编辑动作
function CmInput({ value, placeholder, onChange, evalResult }) {
  options.placeholder = placeholder;
  let classNames = [styles.cmEval];
  let alertNode = null;
  if (evalResult && evalResult.code !== 0) {
    classNames.push(styles.cmEvalFail);
    alertNode = (
      <div className={styles.cmEvalMsg} >
        <Alert closable message={evalResult.msg} type='error' />
      </div>
    );
  } else {
    classNames.push(styles.cmEvalOk);
  }
  return (
    <div className={classNames.join(' ')} >
      <CodeMirror
        value={value}
        options={options}
        onChange={(editor, data, value) => {
          if (onChange) {
            onChange(value);
          }
        }}
      />
      {alertNode}
    </div>
  )
}

export const EvalResult = {};
EvalResult.propTypes = {
  code: PropTypes.number.isRequired,
  msg: PropTypes.string.isRequired,
}

CmInput.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  onChange: PropTypes.func,
  evalResult: PropTypes.shape(EvalResult),
}

export default CmInput;