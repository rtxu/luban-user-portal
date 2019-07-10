import PropTypes from 'prop-types';
import styles from './Config.less';
import { 
  Switch as AntSwitch,
  Input as AntInput,
  Tooltip,
} from "antd";

// [layout
// layout]

// [component
function Switch({checked, onChange, description}) {
  return (
    <div className={styles.switch}>
      <AntSwitch defaultChecked={checked} onChange={onChange} />
      <span>{description}</span>
    </div>
  );
}

Switch.propTypes = {
  checked: PropTypes.bool.isRequired,
  onChange: PropTypes.func.isRequired,
  description: PropTypes.string.isRequired,
};

function Input({
  label, 
  labelTooltip, 
  inputType, 
  inputPlaceHolder, 
  inputDefaultValue,
  onChange,
  onPressEnter,
}) {
  const labelNode = labelTooltip ? (
    <Tooltip title={labelTooltip}>
      <label>{label}</label>
    </Tooltip>
  ) : (
      <label>{label}</label>
  );
  return (
    <>
      {labelNode}
      <AntInput 
        type={inputType}
        placeholder={inputPlaceHolder} 
        defaultValue={inputDefaultValue} 
        onChange={onChange}
        onPressEnter={onPressEnter}
      />
    </>
  );
}

Input.propTypes = {
  label: PropTypes.string.isRequired,
  labelTooltip: PropTypes.string,
  inputType: PropTypes.string,
  inputPlaceHolder: PropTypes.string,
  inputDefaultValue: PropTypes.string,
  onChange: PropTypes.func,
  onPressEnter: PropTypes.func,
};

Input.defaultProps = {
  inputType: 'text',
};
// component]

const _ = {};
_.Switch = Switch;
_.Input = Input;

export default _;