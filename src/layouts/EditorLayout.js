import { Component } from 'react';
import { Layout} from 'antd';
import ControPanel from '../components/editor/ControlPanel';
import ModelBrowser from '../components/editor/ModelBrowser';
import EditorCanvas from '../components/editor/EditorCanvas';
import QueryEditor from '../components/editor/QueryEditor';
import WidgetPicker from '../components/editor/WidgetPicker';

const { Header, Sider, Content } = Layout;

export default class EditorLayout extends Component {
  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <Header style={{ backgroundColor: 'rgba(255, 255, 255, .2)', border: 'solid black 1px' }}>
          <ControPanel />
        </Header>
        <Layout style={{ height: '100%' }}>
          <Sider style={{ backgroundColor: 'rgba(255, 255, 255, .2)', border: 'solid black 1px' }}>
            <ModelBrowser />
          </Sider>
          <Layout>
            <Layout>
              <Content style={{ backgroundColor: 'rgba(255, 255, 255, .2)', border: 'solid black 1px' }}>
                <EditorCanvas />
              </Content>
              <Layout style={{ backgroundColor: 'rgba(255, 255, 255, .2)', border: 'solid black 1px' }}>
                <QueryEditor />
              </Layout>
            </Layout>
            <Sider style={{ backgroundColor: 'rgba(255, 255, 255, .2)', border: 'solid black 1px' }}>
              <WidgetPicker />
            </Sider>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}