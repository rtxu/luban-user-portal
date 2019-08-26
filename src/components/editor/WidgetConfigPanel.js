import React from 'react';
import PropTypes from 'prop-types'
import { Typography } from 'antd';
import { connect } from 'dva';

import WidgetBox from './WidgetBox';
import { NS, withAfterSave } from '@/pages/editor/models/widgets';
import { wrapDispatchToFire } from '@/util'
import WidgetFactory from '../WidgetFactory';
import styles from './WidgetConfigPanel.less';

const mapStateToProps = (state) => ({
  widgets: state[NS],
});
const mapDispatchToProps = (dispatch) => {
  return wrapDispatchToFire(dispatch, (fire) => {
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
  })
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

function WidgetConfigPanel({widgetId, widgets, widgetDispatch, changeWidgetId, notifyWidgetIdChanged}) {
  const widget = widgets[widgetId];
  const widgetConfigPanel = WidgetFactory.createConfigPanelElement(
    widget.type,
    {
      ...widget.content,
      dispatch: (action) => {
        widgetDispatch(widgetId, action)
      },
    },
  );

  function onChange(newWidgetId) {
    changeWidgetId(widgetId, newWidgetId)
    notifyWidgetIdChanged(newWidgetId);
  }
  return (
    <div className={styles.widgetConfigPanel}>
      <Header widgetId={widgetId} onChange={onChange} />
      {widgetConfigPanel}
    </div>
  )
}

WidgetConfigPanel.propTypes = {
  // from `widgets` model
  widgets: PropTypes.objectOf(PropTypes.shape(WidgetBox.propTypes)).isRequired,
  widgetDispatch: PropTypes.func.isRequired,
  changeWidgetId: PropTypes.func.isRequired,

  // from pages/editor/$app
  widgetId: PropTypes.string.isRequired,
  notifyWidgetIdChanged: PropTypes.func.isRequired,
}

WidgetConfigPanel.defaultProps = {
}

WidgetConfigPanel.Header = Header;
export default connect(mapStateToProps, mapDispatchToProps)(WidgetConfigPanel);