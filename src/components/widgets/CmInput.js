import { useState } from 'react';
import { Controlled as CodeMirror } from 'react-codemirror2'
import PropTypes from 'prop-types';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/neo.css';
import 'codemirror/addon/display/placeholder';
import { Alert } from 'antd';
import classNames from 'classnames';
import styles from './CmInput.less';

const options = {
  mode: 'javascript',
  theme: 'neo',
  lineWrapping: true,
  lineNumbers: false,
  viewportMargin: Infinity,
};

function CmInput({ value, placeholder, evalResult, ...eventHandlers }) {
  const [evalResultVisible, setEvalResultVisible] = useState(false);
  options.placeholder = placeholder;
  const cls = classNames({
    [styles.cmEval]: true,
    [styles.cmEvalFail]: evalResult && evalResult.code !== 0,
    [styles.cmEvalOk]: !(evalResult && evalResult.code !== 0),
  });
  let evalResultNode = null;
  if (evalResult && evalResultVisible) {
    const msgType = evalResult.code === 0 ? 'success' : 'error';
    evalResultNode = (
      <div className={styles.cmEvalMsg} >
        <Alert message={evalResult.msg} type={msgType} />
      </div>
    );
  }
  return (
    // WARNING(ruitao.xu): 
    // 太坑了，经过测试，ControlledCodeMirror 的 onBeforeChange 是传统 <input> 组件的 onChange，
    // 而 onChange 是 props.value 发生变化以后的 callback
    // onChange={(editor, data, newValue) => { }}
    <div className={cls} >
      <CodeMirror
        value={value}
        options={options}
        { ...eventHandlers }
        onBlur={() => setEvalResultVisible(false)}
        onCursor={() => setEvalResultVisible(true)}
      />
      {evalResultNode}
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
  evalResult: PropTypes.shape(EvalResult),
}

export default CmInput;