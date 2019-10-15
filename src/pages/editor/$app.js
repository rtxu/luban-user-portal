import React, { useState, useEffect, } from 'react';
import { Layout} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import PropTypes from 'prop-types';
import { connect } from 'dva';
import isEqual from 'lodash.isequal';

import ControPanel from '../../components/editor/ControlPanel';
import ModelBrowser from '../../components/editor/ModelBrowser';
import EditorCanvas from '../../components/editor/EditorCanvas';
import OperationEditor from '../../components/editor/OperationEditor';
import WidgetPicker from '../../components/editor/WidgetPicker';
import WidgetConfigPanel from '../../components/editor/WidgetConfigPanel';
import styles from './index.less';
import { addOperation, deleteOperation, setOperationData, setOperationInput } from './models/operations';
import { setActiveOpId } from './models/editorCtx';
import { getToEvalTemplates, getEvalContext } from './models/widgets';
import { evaluate } from '../../util/template';

const { Header, Sider, Content } = Layout;

const mapStateToOperationEditorProps = (state) => {
  return {
    opNames: Object.keys(state.operations),
    activeOp: state.operations[state.editorCtx.activeOpId],
  }
}
const mapDispatchToOperationEditorProps = (dispatch) => {
  return {
    onAddOperation: (id) => {
      dispatch({
        type: `operations/${addOperation}`,
        payload: {id},
      });
    },
    onDeleteOperation: (id) => {
      console.log('to delete ', id);
      dispatch({
        type: `operations/${deleteOperation}`,
        payload: id,
      });
    },
    onSetOperationData: (id, data) => {
      dispatch({
        type: `operations/${setOperationData}`,
        payload: {id, data},
      });
    },
    onSetOperationInput: (id, input) => {
      dispatch({
        type: `operations/${setOperationInput}`,
        payload: {id, input},
      });
    },
    onSetActiveOpId: (id) => {
      dispatch({
        type: `editorCtx/${setActiveOpId}`,
        payload: id,
      });
    },
  }
}
const OperationEditorC = connect(
  mapStateToOperationEditorProps, 
  mapDispatchToOperationEditorProps,
)(OperationEditor);

function SubLayout({ selectedWidgetId, setSelectedWidgetId, widgets, opMap, activeOpId, dispatch }) {
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
        <Content className={styles.EditorCanvasContainer}>
          <EditorCanvas 
            selectedWidgetId={selectedWidgetId} 
            setSelectedWidgetId={setSelectedWidgetId}
            widgets={widgets} />
        </Content>
        <Content className={styles.OperationEditorContainer} >
          <OperationEditorC />
        </Content>
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

function EditorLayout({ widgets, opMap, activeOpId, dispatch }) {
  const [selectedWidgetId, setSelectedWidgetId] = useState(null);

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
          activeOpId={activeOpId}
          dispatch={dispatch}
        />
      </Layout>
    </Layout>
  )
}

const getAllUserInputs = (state) => {
  const allUserInputs = [];
  for (const widget of Object.values(state.widgets)) {
    if (widget.content.templateMap) {
      for (const [propId, templateObj] of Object.entries(widget.content.templateMap)) {
        allUserInputs.push({
          id: `${widget.id}.${propId}`,
          type: 'normal',
          input: templateObj.template,
        });
      }
    }
  }
  return allUserInputs; 
}

const EditorApp = ({ match, toEvalTemplates, evalContext, widgets, opMap, activeOpId, dispatch}) => {
  const [lastEvalEnv, setLastEvalEnv] = useState([]);

  useEffect(() => {
    console.log(`app initializing: ${match.params.app}`)
    return function cleanup() {
      console.log(`app un-initializing: ${match.params.app}`)
    };
  }, []);

  useEffect(() => {
    const evalEnv = {
      plainObjTemplates: toEvalTemplates.map((tmpl) => ({
        id: tmpl.id,
        type: tmpl.type,
        input: tmpl.input,
      })),
      evalContext,
    }

    if (isEqual(evalEnv, lastEvalEnv)) {
    } else {
      console.log('trigger re-evaluate');
      console.log('to eval templates: ', toEvalTemplates)
      console.log('eval context: ', evalContext)
      const templates = toEvalTemplates.map((tmpl) => ({
        id: tmpl.id,
        type: tmpl.type,
        input: tmpl.input,
        onEval: (value, extra, error) => {
          console.log('evaluated', value, extra, error);
          const action = tmpl.onEvalActionCreator(value, extra, error);
          console.log('action', action);
          dispatch(action);
        }
      }))
      evaluate(templates, evalContext);
      setLastEvalEnv(evalEnv);
    }
  });

  return (
    <EditorLayout
      widgets={widgets}
      opMap={opMap}
      activeOpId={activeOpId}
      dispatch={dispatch}
     />
  )
}

const mapStateToProps = (state) => {
  return {
    widgets: state.widgets,
    opMap: state.operations,
    activeOpId: state.editorCtx.activeOpId,
    toEvalTemplates: getToEvalTemplates(state.widgets),
    evalContext: getEvalContext(state.widgets),
  };
};
export default connect(mapStateToProps)(EditorApp);