import React, { useState, useEffect, } from 'react';
import { Layout} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import { connect } from 'dva';

import ControPanel from '../../components/editor/ControlPanel';
import ModelBrowser from '../../components/editor/ModelBrowser';
import EditorCanvas from '../../components/editor/EditorCanvas';
import OperationEditor from '../../components/editor/OperationEditor';
import WidgetPicker from '../../components/editor/WidgetPicker';
import WidgetConfigPanel from '../../components/editor/WidgetConfigPanel';
import styles from './index.less';
import { getEvaluatedWidgets } from './selectors';

const { Header, Sider, Content } = Layout;

function SubLayout({ selectedWidgetId, setSelectedWidgetId, widgets, opMap, activeOp, dispatch }) {
  let rightSider;
  if (selectedWidgetId) {
    rightSider = <WidgetConfigPanel 
      widget={widgets[selectedWidgetId]} 
      notifyWidgetIdChanged={setSelectedWidgetId}
      widgets={widgets}
    />
  } else {
    rightSider = <WidgetPicker />
  }
  return (
    <Layout>
      <Layout>
        <Content className={styles.defaultBg}>
          <EditorCanvas 
            selectedWidgetId={selectedWidgetId} 
            setSelectedWidgetId={setSelectedWidgetId}
            widgets={widgets} />
        </Content>
        <Layout className={styles.defaulBg} >
          <OperationEditor opMap={opMap} activeOp={activeOp} dispatch={dispatch} />
        </Layout>
      </Layout>
      <Sider className={styles.defaultBg} width={275} >
        {rightSider}
      </Sider>
    </Layout>
  )
}

SubLayout.propTypes = {
  selectedWidgetId: PropTypes.string,
  setSelectedWidgetId: PropTypes.func,
}
SubLayout.defaultProps = { }

const EditorDndLayout = DragDropContext(HTML5Backend)(SubLayout);

const mapStateToProps = (state) => {
  return {
    widgets: getEvaluatedWidgets(state),
    opMap: state.operations.opMap,
    activeOp: state.operations.activeOp,
  };
};

function EditorLayout({ match, widgets, opMap, activeOp, dispatch }) {
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);

  useEffect(() => {
    console.log(`app initializing: ${match.params.app}`)
    return function cleanup() {
      console.log(`app un-initializing: ${match.params.app}`)
    }
  }, []);
  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={styles.defaultBg}>
        <ControPanel />
      </Header>
      <Layout style={{ height: '100%' }}>
        <Sider className={styles.defaultBg} width={275}>
          <ModelBrowser selectedWidgetId={selectedWidgetId} widgets={widgets} />
        </Sider>
        <EditorDndLayout 
          selectedWidgetId={selectedWidgetId} 
          setSelectedWidgetId={setSelectedWidgetId} 
          widgets={widgets}
          opMap={opMap}
          activeOp={activeOp}
          dispatch={dispatch}
        />
      </Layout>
    </Layout>
  )
}

export default connect(mapStateToProps)(EditorLayout);