import PropTypes from 'prop-types';
import styles from './Text.less';
import classNames from 'classnames';
import TemplateEntry from '../TemplateEntry';

function Text({ templateMap, isScrollWhenOverflow, isExpandWhenHover }) {
  const cls = classNames({
    [styles.widgetText]: true,
    [styles.scroll]: isScrollWhenOverflow,
    [styles.hover]: isScrollWhenOverflow && isExpandWhenHover,
  });
  return (
    <div className={cls}>
      <p>{templateMap.value.value}</p>
    </div>
  );
}

Text.propTypes = {
  isScrollWhenOverflow: PropTypes.bool,
  isExpandWhenHover: PropTypes.bool,

  templateMap: PropTypes.objectOf(PropTypes.shape(TemplateEntry.propTypes)),
};

export default Text;
