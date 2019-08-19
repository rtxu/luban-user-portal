import { useState, useReducer } from 'react';
import { Layout } from 'antd';
import styles from './index.less'
import Text from '../../components/widgets/Text';
import TextInput from '../../components/widgets/TextInput';
import Button from '../../components/widgets/Button';
import Table from '../../components/widgets/table';
import OneLineOverflowText from '../../components/widgets/table/OneLineOverflowText';
import WidgetFactory from '../../components/WidgetFactory';

const { Sider, Content } = Layout;

function useWidgetFactory(type) {
  const textWidget = Text.use();
  const textInputWidget = TextInput.use();
  const buttonWidget = Button.use();
  const tableWidget = Table.use();
  const oneLineOverflowTextWidget = OneLineOverflowText.use();

  switch(type) {
    case WidgetFactory.Type.TEXT:
      return textWidget;
    case WidgetFactory.Type.TEXTINPUT:
      return textInputWidget;
    case WidgetFactory.Type.BUTTON:
      return buttonWidget;
    case WidgetFactory.Type.TABLE:
      return tableWidget;
    case WidgetFactory.Type.ONE_LINE_OVERFLOW_TEXT:
      return oneLineOverflowTextWidget;

    default:
      throw new Error(`unexpected widget type: ${type}`);
  }
}

function WidgetDebugger({ match }) {
  const [height, setHeight] = useState(360);
  const [width, setWidth] = useState(360);

  function handleHeightChange(e) {
    setHeight(Number(e.target.value));
  }

  function handleWidthChange(e) {
    setWidth(Number(e.target.value));
  }

  const containerStyle={
    height: height,
    width: width,
  }

  const [widget, widgetProps, widgetConfigPanel] = useWidgetFactory(match.params.widget);

  return (
    <Layout>
      <Sider theme='light' width={256} style={{ minHeight: '100vh' }}>
        <pre>
          {JSON.stringify(widgetProps, null, 2)}
        </pre>
      </Sider>
      <Content style={{ margin: '24px 16px 0' }}>
        <div className={styles.numberInput}>
          <label>容器 Height: </label>
          <input type='number' value={height} onChange={handleHeightChange} />
        </div>
        <div className={styles.numberInput}>
          <label>容器 Width: </label>
          <input type='number' value={width} onChange={handleWidthChange} />
        </div>
        <hr/>
        <div className={styles.widgetContainer} style={containerStyle}>
          {widget}
        </div>
      </Content>
      <Sider theme='light' width={256} style={{ minHeight: '100vh' }}>
        {widgetConfigPanel}
      </Sider>
    </Layout>
  )
}

export default WidgetDebugger;