import { Alert } from "antd";
import classNames from "classnames";
import "codemirror/addon/display/placeholder";
import "codemirror/lib/codemirror.css";
import "codemirror/mode/javascript/javascript";
import "codemirror/mode/sql/sql";
import "codemirror/theme/neo.css";
import PropTypes from "prop-types";
import React, { useState } from "react";
import { Controlled as CodeMirror } from "react-codemirror2";

// @ts-ignore
import styles from "./CmEvalInput.less";

// CodeMirror Evalation Input
function CmEvalInput({ value, options, evalResult, onChange }) {
  const [evalResultVisible, setEvalResultVisible] = useState(false);
  const cls = classNames({
    [styles.cmEval]: true,
    [styles.cmEvalFail]: evalResult && evalResult.code !== 0,
    [styles.cmEvalOk]: !(evalResult && evalResult.code !== 0)
  });
  let evalResultNode = null;
  if (evalResult && evalResultVisible) {
    const msgType = evalResult.code === 0 ? "success" : "error";
    evalResultNode = (
      <div className={styles.cmEvalMsg}>
        <Alert message={evalResult.msg} type={msgType} />
      </div>
    );
  }
  return (
    // WARNING(ruitao.xu):
    // 太坑了，经过测试，ControlledCodeMirror 的 onBeforeChange 是传统 <input> 组件的 onChange，
    // 而 onChange 是 props.value 发生变化以后的 callback
    // onChange={(editor, data, newValue) => { }}
    // ref: https://github.com/scniro/react-codemirror2
    <div className={cls}>
      <CodeMirror
        value={value}
        options={options}
        onBeforeChange={(editor, data, newValue) => {
          onChange(newValue);
        }}
        onBlur={() => setEvalResultVisible(false)}
        onCursor={() => setEvalResultVisible(true)}
      />
      {evalResultNode}
    </div>
  );
}

export const EvalResult: any = {};
EvalResult.propTypes = {
  code: PropTypes.number.isRequired,
  msg: PropTypes.string.isRequired
};

export interface IEvalResult {
  code: number;
  msg: string;
}

CmEvalInput.propTypes = {
  value: PropTypes.string,
  // ref: https://codemirror.net/doc/manual.html#config
  options: PropTypes.object,
  evalResult: PropTypes.shape(EvalResult),

  // actions
  onChange: PropTypes.func.isRequired
};

export default CmEvalInput;
