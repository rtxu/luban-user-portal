import PropTypes from 'prop-types';
import styles from './Config.less';
import { 
  Switch as AntSwitch,
  Input as AntInput,
  Tooltip,
  Select,
} from "antd";

// [layout
// layout]

// [component
function Switch({disabled, checked, onChange, description}) {
  return (
    <div className={styles.switch}>
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

function LabelInput({
  label, 
  input, 
}) {
  return (
    <div className={styles.labelEntry}>
      <Label {...label} />
      <AntInput 
        type={input.type}
        placeholder={input.placeholder} 
        value={input.value} 
        defaultValue={input.defaultValue} 
        onChange={input.onChange}
        onPressEnter={input.onPressEnter}
      />
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

function LabelSelect({
  label, 
  select, 
}) {
  return (
    <div className={styles.labelEntry}>
      <Label {...label} />
      <Select style={{display: 'block'}} defaultValue={select.defaultValue}>
        { select.options.map((option) => {
          <Option value={option} key={option}>{option}</Option>
        }) }
      </Select>
    </div>
  );
}

LabelSelect.propTypes = {
  label: PropTypes.shape(Label.propTypes).isRequired,
  select: PropTypes.shape({
    defaultValue: PropTypes.string,
    options: PropTypes.arrayOf(PropTypes.string).isRequired,
  }),
};
// component]

const _ = {};
_.Switch = Switch;
_.LabelInput = LabelInput;
_.LabelSelect = LabelSelect;

export default _;