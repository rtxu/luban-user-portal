import React from 'react';
import PropTypes from 'prop-types';
import styles from './Config.less';
import { 
  Switch as AntSwitch,
  Input as AntInput,
  Tooltip,
  Select,
} from "antd";
import CmEvalInput, { EvalResult } from '../CmEvalInput';

// [layout
// layout]

// [component
function Switch({disabled, checked, onChange, description}) {
  const classNames = [styles.labelEntry, styles.switch];
  return (
    <div className={classNames.join(' ')}>
      <AntSwitch disabled={disabled} checked={checked} onChange={onChange} />
      <span>{description}</span>
    </div>
  );
}

Switch.propTypes = {
  disabled: PropTypes.bool,
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
};

Switch.defaultProps = {
  disabled: false,
};

function Label({value, tooltip}) {
  const labelNode = tooltip ? (
    <Tooltip title={tooltip}>
      <label>{value}</label>
    </Tooltip>
  ) : (
      <label>{value}</label>
  );

  return labelNode;
}

Label.propTypes = {
  value: PropTypes.string.isRequired,
  tooltip: PropTypes.string,
}

function LabelInput({ label, input, }) {
  return (
    <div className={styles.labelEntry}>
      <Label {...label} />
      {/* TODO(ruitao.xu): replace all config input by CodeMirror */}
      <AntInput {...input} />
    </div>
  );
}

LabelInput.propTypes = {
  label: PropTypes.shape(Label.propTypes).isRequired,
  input: PropTypes.shape({
    type: PropTypes.string,
    value: PropTypes.string,
    placeholder: PropTypes.string,
    defaultValue: PropTypes.string,
    onChange: PropTypes.func,
    onPressEnter: PropTypes.func,
  }),
};

function LabelCmEvalInput({ label, input, }) {
  const defaultOptions = {
    mode: 'javascript',
    theme: 'neo',
    lineWrapping: true,
    lineNumbers: false,
    viewportMargin: Infinity,
  };

  const { options: userOptions } = input;
  const options = {
    ...defaultOptions,
    ...userOptions,
  }

  return (
    <div className={styles.labelEntry}>
      <Label {...label} />
      <CmEvalInput {...input} options={options} />
    </div>
  );
}

LabelCmEvalInput.propTypes = {
  label: PropTypes.shape(Label.propTypes).isRequired,
  input: PropTypes.shape(CmEvalInput.propTypes),
};


function LabelSelect({ label, select, }) {
  return (
    <div className={styles.labelEntry}>
      {label && <Label {...label} />}
      <Select 
        style={{display: 'block'}} 
        defaultValue={select.defaultValue}
        onChange={select.onChange}
        placeholder={select.placeholder}
      >
        { select.options.map((option, index) => (
          <Select.Option value={option} key={index}>{option}</Select.Option>
        )) }
      </Select>
    </div>
  );
}

LabelSelect.propTypes = {
  label: PropTypes.shape(Label.propTypes),
  select: PropTypes.shape({
    defaultValue: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
    onChange: PropTypes.func.isRequired,
    placeholder: PropTypes.string,
  }),
};
// component]

const _ = {};
_.Switch = Switch;
_.Label = Label;
_.LabelInput = LabelInput;
_.LabelCmEvalInput = LabelCmEvalInput;
_.LabelCmEvalInput.EvalResult = EvalResult;
_.LabelSelect = LabelSelect;

export default _;