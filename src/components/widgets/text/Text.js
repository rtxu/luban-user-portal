import PropTypes from 'prop-types';
import styles from './Text.less';
import classNames from 'classnames';

function Text({ value, isScrollWhenOverflow, isExpandWhenHover }) {
  const cls = classNames({
    [styles.widgetText]: true,
    [styles.scroll]: isScrollWhenOverflow,
    [styles.hover]: isScrollWhenOverflow && isExpandWhenHover,
  });
  return (
    <div className={cls}>
      <p>{value}</p>
    </div>
  );
}

Text.propTypes = {
  value: PropTypes.string.isRequired,
  isScrollWhenOverflow: PropTypes.bool,
  isExpandWhenHover: PropTypes.bool,
};

Text.defaultProps = {
  value: '这里填被展示的文本 😃',
  isScrollWhenOverflow: false,
  isExpandWhenHover: false,
};

export default Text;
