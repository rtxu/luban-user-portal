import PropTypes from 'prop-types';
import styles from './Widget.less';
import classNames from 'classnames';

function Text({ value, isScrollWhenOverflow, isExpandWhenHover }) {
  const cls = classNames({
    [styles.widgetText]: true,
    [styles.scroll]: isScrollWhenOverflow,
    [styles.hover]: isScrollWhenOverflow && isExpandWhenHover,
  });
  return (
    <div className={cls}>
      <span>{value}</span>
    </div>
  );
}

Text.propTypes = {
  isScrollWhenOverflow: PropTypes.bool,
  isExpandWhenHover: PropTypes.bool,

  valueInput: PropTypes.string,
  value: PropTypes.string,
  valueError: PropTypes.string,
  
  dispatch: PropTypes.func.isRequired,
};

export default Text;
