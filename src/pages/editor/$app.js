import React, { useState, } from 'react';
import { Layout} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import PropTypes from 'prop-types'

import ControPanel from '../../components/editor/ControlPanel';
import ModelBrowser from '../../components/editor/ModelBrowser';
import EditorCanvas from '../../components/editor/EditorCanvas';
import QueryEditor from '../../components/editor/QueryEditor';
import WidgetPicker from '../../components/editor/WidgetPicker';
import WidgetBox from '../../components/editor/WidgetBox';
import styles from './index.less';
import WidgetFactory from '../../components/WidgetFactory';
import { NS, withAfterSave } from '@/pages/editor/models/widgets';
import { connect } from 'dva';
import { wrapDispatchToFire } from '@/util'

const { Header, Sider, Content } = Layout;

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
    };
  })
};

function SubLayout({widgets, widgetDispatch}) {
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);
  let rightSider;
  if (selectedWidgetId) {
    const selectedWidget = widgets[selectedWidgetId];
    rightSider = WidgetFactory.createConfigPanelElement(
      selectedWidget.type,
      {
        ...selectedWidget.content,
        dispatch: (action) => {
          widgetDispatch(selectedWidgetId, action)
        },
      },
    );
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
      <Sider className={[styles.overflowAuto, styles.defaultBg].join(' ')} width={300} >
        {rightSider}
      </Sider>
    </Layout>
  )
}

SubLayout.propTypes = {
  // from `widgets` model
  widgets: PropTypes.objectOf(PropTypes.shape(WidgetBox.propTypes)).isRequired,
  widgetDispatch: PropTypes.func.isRequired,
}

SubLayout.defaultProps = { }

const connectedSubLayout = connect(mapStateToProps, mapDispatchToProps)(SubLayout);

const EditorDndLayout = DragDropContext(HTML5Backend)(connectedSubLayout);

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