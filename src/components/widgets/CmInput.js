import { Controlled as CodeMirror } from 'react-codemirror2'
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

function CmInput({ value, placeholder, evalResult, ...eventHandlers }) {
  options.placeholder = placeholder;
  let classNames = [styles.cmEval];
  let alertNode = null;
  if (evalResult && evalResult.code !== 0) {
    classNames.push(styles.cmEvalFail);
    if (evalResult.visible) {
      alertNode = (
        <div className={styles.cmEvalMsg} >
          <Alert closable message={evalResult.msg} type='error' />
        </div>
      );
    }
  } else {
    classNames.push(styles.cmEvalOk);
  }
  return (
    // WARNING(ruitao.xu): 
    // 太坑了，经过测试，ControlledCodeMirror 的 onBeforeChange 是传统 <input> 组件的 onChange，
    // 而 onChange 是 props.value 发生变化以后的 callback
    // onChange={(editor, data, newValue) => { }}
    <div className={classNames.join(' ')} >
      <CodeMirror
        value={value}
        options={options}
        { ...eventHandlers }
      />
      {alertNode}
    </div>
  )
}

export const EvalResult = {};
EvalResult.propTypes = {
  code: PropTypes.number.isRequired,
  msg: PropTypes.string.isRequired,
  visible: PropTypes.bool.isRequired,
}

CmInput.propTypes = {
  value: PropTypes.string,
  placeholder: PropTypes.string,
  evalResult: PropTypes.shape(EvalResult),
}

export default CmInput;