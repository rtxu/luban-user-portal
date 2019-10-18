import React from 'react';
import PropTypes from 'prop-types'
import { Typography, message } from 'antd';

import WidgetBox from './WidgetBox';
import WidgetFactory from '../WidgetFactory';
import styles from './WidgetConfigPanel.less';

function Header(props) {
  const { widgetId } = props;
  const { Text, } = Typography;

  function onChange(newWidgetId) {
    props.onChange(newWidgetId);
  }

  return (
    <div className={styles.header} >
      <div className={styles.content} >
        <Text editable={{ onChange }}>
          {widgetId}
        </Text>
      </div>
    </div>
  )
}

Header.propTypes = {
  widgetId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
}

Header.defaultProps = {
}

function WidgetConfigPanel({widget, onWidgetDispatch, onChangeWidgetId, widgets}) {
  const widgetConfigPanel = WidgetFactory.createConfigPanelElement(
    widget.type,
    {
      ...widget.content,
      dispatch: (action) => {
        onWidgetDispatch(widget.id, action)
      },
    },
  );

  function onChange(newWidgetId) {
    if (newWidgetId in widgets) {
      message.error(`${newWidgetId} 已经存在`);
    } else {
      onChangeWidgetId(widget.id, newWidgetId)
    }
  }
  return (
    <div className={styles.widgetConfigPanel}>
      <Header widgetId={widget.id} onChange={onChange} />
      {widgetConfigPanel}
    </div>
  )
}

WidgetConfigPanel.propTypes = {
  widget: PropTypes.shape(WidgetBox.propTypes).isRequired,
  widgets: PropTypes.objectOf(PropTypes.shape(WidgetBox.propTypes)).isRequired,

  onWidgetDispatch: PropTypes.func.isRequired,
  onChangeWidgetId: PropTypes.func.isRequired,
}

WidgetConfigPanel.Header = Header;

export default WidgetConfigPanel;