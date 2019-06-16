import { Component } from 'react';
import { Layout} from 'antd';
import ControPanel from '../components/editor/ControlPanel';
import ModelBrowser from '../components/editor/ModelBrowser';
import EditorCanvas from '../components/editor/EditorCanvas';
import QueryEditor from '../components/editor/QueryEditor';
import WidgetPicker from '../components/editor/WidgetPicker';
import myStyles from './EditorLayout.css';

const { Header, Sider, Content } = Layout;

export default class EditorLayout extends Component {
  render() {
    return (
      <Layout style={{ height: '100vh' }}>
        <Header className={myStyles.defaultBg}>
          <ControPanel />
        </Header>
        <Layout style={{ height: '100%' }}>
          <Sider className={myStyles.defaultBg}>
            <ModelBrowser />
          </Sider>
          <Layout>
            <Layout>
              <Content className={myStyles.defaultBg}>
                <EditorCanvas />
              </Content>
              <Layout className={myStyles.defaultBg}>
                <QueryEditor />
              </Layout>
            </Layout>
            <Sider className={myStyles.overflowAuto + ' ' + myStyles.defaultBg}>
              <WidgetPicker />
            </Sider>
          </Layout>
        </Layout>
      </Layout>
    )
  }
}