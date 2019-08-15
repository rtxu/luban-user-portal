import React, { useReducer } from 'react';
import { Layout} from 'antd';
import ControPanel from '../../components/editor/ControlPanel';
import ModelBrowser from '../../components/editor/ModelBrowser';
import EditorCanvas from '../../components/editor/EditorCanvas';
import QueryEditor from '../../components/editor/QueryEditor';
import WidgetPicker from '../../components/editor/WidgetPicker';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import myStyles from './index.css';

const { Header, Sider, Content } = Layout;

function SubLayout({}) {
  return (
    <Layout>
      <Layout>
        <Content className={myStyles.defaultBg}>
          <EditorCanvas />
        </Content>
        <Layout className={myStyles.defaultBg} style={{ display: 'none' }}>
          <QueryEditor />
        </Layout>
      </Layout>
      <Sider className={[myStyles.overflowAuto, myStyles.defaultBg].join(' ')} width={300} >
        <WidgetPicker />
      </Sider>
    </Layout>
  )
}

const EditorDndLayout = DragDropContext(HTML5Backend)(SubLayout);

function EditorLayout({}) {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={myStyles.defaultBg}>
        <ControPanel />
      </Header>
      <Layout style={{ height: '100%' }}>
        <Sider className={myStyles.defaultBg} style={{display: 'none'}}>
          <ModelBrowser />
        </Sider>
        <EditorDndLayout />
      </Layout>
    </Layout>
  )
}

export default EditorLayout;