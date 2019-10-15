import PropTypes from 'prop-types';
import styles from './Widget.less';
import classNames from 'classnames';

function Text({ valueTemplate, isScrollWhenOverflow, isExpandWhenHover }) {
  const cls = classNames({
    [styles.widgetText]: true,
    [styles.scroll]: isScrollWhenOverflow,
    [styles.hover]: isScrollWhenOverflow && isExpandWhenHover,
  });
  return (
    <div className={cls}>
      <span>{valueTemplate.value}</span>
    </div>
  );
}

Text.propTypes = {
  isScrollWhenOverflow: PropTypes.bool,
  isExpandWhenHover: PropTypes.bool,

  valueTemplate: PropTypes.object,
  
  dispatch: PropTypes.func.isRequired,
};

export default Text;
