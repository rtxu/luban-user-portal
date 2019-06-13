import { Component } from 'react';
import { Layout} from 'antd';
import ControPanel from '../components/editor/ControlPanel';
import ModelBrowser from '../components/editor/ModelBrowser';
import EditorCanvas from '../components/editor/EditorCanvas';
import QueryEditor from '../components/editor/QueryEditor';
import WidgetPicker from '../components/editor/WidgetPicker';

const { Header, Sider, Content } = Layout;

const bgStyle = { backgroundColor: 'rgba(255, 255, 255, .2)', border: 'solid black 1px' };

export default class EditorLayout extends Component {
  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <Header style={bgStyle}>
          <ControPanel />
        </Header>
        <Layout style={{ height: '100%' }}>
          <Sider style={bgStyle}>
            <ModelBrowser />
          </Sider>
          <Layout>
            <Layout>
              <Content style={bgStyle}>
                <EditorCanvas />
              </Content>
              <Layout style={bgStyle}>
                <QueryEditor />
              </Layout>
            </Layout>
            <Sider style={bgStyle}>
              <WidgetPicker />
            </Sider>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}