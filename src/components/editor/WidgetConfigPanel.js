import React, { useContext } from "react";
import PropTypes from "prop-types";
import { Typography, message } from "antd";

import WidgetFactory from "../WidgetFactory";
import styles from "./WidgetConfigPanel.less";
import { AppContext } from "../containers/withAppContext";
import { EditorContext } from "../containers/withEditorContext";

function Header(props) {
  const { widgetId } = props;
  const { Text } = Typography;

  function onChange(newWidgetId) {
    props.onChange(newWidgetId);
  }

  return (
    <div className={styles.header}>
      <div className={styles.content}>
        <Text editable={{ onChange }}>{widgetId}</Text>
      </div>
    </div>
  );
}

Header.propTypes = {
  widgetId: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired
};

Header.defaultProps = {};

function WidgetConfigPanel({}) {
  const [{ widgets }] = useContext(AppContext);
  const [{ activeWidgetId }, { changeWidgetId }] = useContext(EditorContext);
  const widget = widgets[activeWidgetId];
  const widgetConfigPanel = WidgetFactory.createConfigPanelElement(
    widget.type,
    {
      ...widget.content,
      dispatch: action => {
        widgetDispatch(widget.id, action);
      }
    }
  );

  function onChange(newWidgetId) {
    if (newWidgetId in widgets) {
      message.error(`${newWidgetId} 已经存在`);
    } else {
      changeWidgetId(widget.id, newWidgetId);
    }
  }
  return (
    <div className={styles.widgetConfigPanel}>
      <Header widgetId={widget.id} onChange={onChange} />
      {widgetConfigPanel}
    </div>
  );
}

WidgetConfigPanel.Header = Header;

export default WidgetConfigPanel;
