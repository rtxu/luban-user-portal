import React from 'react';
import PropTypes from 'prop-types'
import { Typography } from 'antd';
import { connect } from 'dva';

import WidgetBox from './WidgetBox';
import { NS, withAfterSave } from '@/pages/editor/models/widgets';
import { wrapDispatchToFire } from '@/util'
import WidgetFactory from '../WidgetFactory';
import styles from './WidgetConfigPanel.less';

const mapDispatchToProps = (dispatch) => {
  const fire = wrapDispatchToFire(dispatch);
  return {
    widgetDispatch: (widgetId, widgetAction) => {
      fire(`${NS}/updateContent`, {
        widgetId,
        widgetAction,
      }, withAfterSave)
    },
    changeWidgetId: (oldWidgetId, newWidgetId) => {
      fire(`${NS}/changeWidgetId`, {
        oldWidgetId,
        newWidgetId,
      }, withAfterSave)
    },
  };
};

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

function WidgetConfigPanel({widget, widgetDispatch, changeWidgetId, notifyWidgetIdChanged}) {
  const widgetConfigPanel = WidgetFactory.createConfigPanelElement(
    widget.type,
    {
      ...widget.content,
      dispatch: (action) => {
        widgetDispatch(widget.id, action)
      },
    },
  );

  function onChange(newWidgetId) {
    changeWidgetId(widget.id, newWidgetId)
    notifyWidgetIdChanged(newWidgetId);
  }
  return (
    <div className={styles.widgetConfigPanel}>
      <Header widgetId={widget.id} onChange={onChange} />
      {widgetConfigPanel}
    </div>
  )
}

WidgetConfigPanel.propTypes = {
  // from `widgets` model
  widgetDispatch: PropTypes.func.isRequired,
  changeWidgetId: PropTypes.func.isRequired,

  // from pages/editor/$app
  widget: PropTypes.shape(WidgetBox.propTypes),
  notifyWidgetIdChanged: PropTypes.func.isRequired,
}

WidgetConfigPanel.defaultProps = {
}

WidgetConfigPanel.Header = Header;
export default connect(undefined, mapDispatchToProps)(WidgetConfigPanel);