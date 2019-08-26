import React, { useState, } from 'react';
import { Layout} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';

import ControPanel from '../../components/editor/ControlPanel';
import ModelBrowser from '../../components/editor/ModelBrowser';
import EditorCanvas from '../../components/editor/EditorCanvas';
import QueryEditor from '../../components/editor/QueryEditor';
import WidgetPicker from '../../components/editor/WidgetPicker';
import WidgetConfigPanel from '../../components/editor/WidgetConfigPanel';
import styles from './index.less';

const { Header, Sider, Content } = Layout;

function SubLayout({}) {
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  let rightSider;
  if (selectedWidgetId) {
    rightSider = <WidgetConfigPanel widgetId={selectedWidgetId} notifyWidgetIdChanged={setSelectedWidgetId} />
  } else {
    rightSider = <WidgetPicker />
  }
  return (
    <Layout>
      <Layout>
        <Content className={styles.defaultBg}>
          <EditorCanvas selectedWidgetId={selectedWidgetId} setSelectedWidgetId={setSelectedWidgetId} />
        </Content>
        <Layout className={styles.defaultBg} style={{ display: 'none' }}>
          <QueryEditor />
        </Layout>
      </Layout>
      <Sider className={[styles.defaultBg].join(' ')} width={300} >
        {rightSider}
      </Sider>
    </Layout>
  )
}

SubLayout.propTypes = { }
SubLayout.defaultProps = { }

const EditorDndLayout = DragDropContext(HTML5Backend)(SubLayout);

function EditorLayout({}) {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={styles.defaultBg}>
        <ControPanel />
      </Header>
      <Layout style={{ height: '100%' }}>
        <Sider className={styles.defaultBg} style={{display: 'none'}}>
          <ModelBrowser />
        </Sider>
        <EditorDndLayout />
      </Layout>
    </Layout>
  )
}

export default EditorLayout;