import React, { useContext } from "react";
import { Typography, message } from "antd";

// @ts-ignore
import styles from "./WidgetConfigPanel.less";

import WidgetFactory from "../WidgetFactory";
import { AppContext } from "../containers/AppContextProvider";
import { EditorContext } from "../containers/withEditorContext";

interface HeaderProps {
  widgetId: string;
  onChange: (newWidgetId: string) => void;
}
const Header: React.FC<HeaderProps> = props => {
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
};

function WidgetConfigPanel() {
  const {
    state: { widgets },
    action: { widgetDispatch }
  } = useContext(AppContext);
  const [
    { activeWidgetId },
    { changeWidgetId, setActiveWidgetId }
  ] = useContext(EditorContext);
  const widget = widgets[activeWidgetId as string];
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
      setActiveWidgetId(newWidgetId);
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
