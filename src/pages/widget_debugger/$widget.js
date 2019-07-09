import { useState, useReducer } from 'react';
import { Layout } from 'antd';
import styles from './index.less'
import Text from '../../components/widgets/Text';
import Widget from '../../components/Widget';

const { Sider, Content } = Layout;

function useTextWidget() {
  const [widgetProps, widgetDispatch] = useReducer(Text.reducer, Text.initialState);
  return ([<Text {...widgetProps} />, 
    widgetProps, 
  <Text.ConfigPanel dispatch={widgetDispatch} {...widgetProps} />]);
}

function WidgetDebugger({}) {
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

  const [widget, widgetProps, widgetConfigPanel] = useTextWidget();

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