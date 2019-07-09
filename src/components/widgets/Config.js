import PropTypes from 'prop-types';
import styles from './Config.less';
import { 
  Switch as AntSwitch,
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

// component]

const _ = {};
_.Switch = Switch;

export default _;