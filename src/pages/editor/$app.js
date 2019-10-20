import React, { useState, useEffect, } from 'react';
import { Layout} from 'antd';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'dva';
import isEqual from 'lodash.isequal';

import ControPanel from '../../components/editor/ControlPanel';
import ModelBrowser from '../../components/editor/ModelBrowser';
import EditorCanvas from '../../components/editor/EditorCanvas';
import OperationEditor from '../../components/editor/OperationEditor';
import WidgetPicker from '../../components/editor/WidgetPicker';
import WidgetConfigPanel from '../../components/editor/WidgetConfigPanel';
import styles from './index.less';
import { addOperation, deleteOperation, setPreparedSqlTemplateInput, execOperation, setOperationType, setOperationOpListWhenSuccess } from './models/operations';
import { setActiveOpId, setActiveWidgetId } from './models/editorCtx';
import { getToEvalTemplates, getEvalContext, getExportedState } from './models/widgets';
import { 
  getToEvalTemplates as opGetToEvalTemplates, 
  getEvalContext as opGetEvalContext,
  getExportedState as opGetExportedState,
} from './models/operations';
import { evaluate } from '../../util/template';
import { wrapDispatchToFire } from '../../util';
import { NS } from './common';

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
        type: `${NS.operations}/${addOperation}`,
        payload: {id},
      });
    },
    onDeleteOperation: (id) => {
      dispatch({
        type: `${NS.operations}/${deleteOperation}`,
        payload: id,
      });
    },
    onExecOperation: (id, data) => {
      dispatch({
        type: `${NS.operations}/${execOperation}`,
        payload: {id, data},
      });
    },
    onSetOperationInput: (id, input) => {
      dispatch({
        type: `${NS.operations}/${setPreparedSqlTemplateInput}`,
        payload: {id, input},
      });
    },
    onSetActiveOpId: (id) => {
      dispatch({
        type: `${NS.editorCtx}/${setActiveOpId}`,
        payload: id,
      });
    },
    onSetOperationType: (id, type) => {
      dispatch({
        type: `${NS.operations}/${setOperationType}`,
        payload: {
          id,
          type,
        },
      });
    },
    onSetOpListWhenSuccess: (id, list) => {
      dispatch({
        type: `${NS.operations}/${setOperationOpListWhenSuccess}`,
        payload: {
          id,
          list,
        },
      });
    },
    onSetOpListWhenFail: (id, list) => {
      dispatch({
        type: `${NS.operations}/${setOperationOpListWhenFail}`,
        payload: {
          id,
          list,
        },
      });
    },
  }
}
/** 
 * app container component: bind app data and behavior with OperationEditor
 * ref: https://medium.com/@dan_abramov/smart-and-dumb-components-7ca2f9a7c7d0
 */
const AppOperationEditor = connect(
  mapStateToOperationEditorProps, 
  mapDispatchToOperationEditorProps,
)(OperationEditor);

const mapStateToModelBrownerProps = (state) => {
  const exportedWidgets = getExportedState(state.widgets);
  const exportedOps = opGetExportedState(state.operations);

  return {
    modelGroups: [
      {
        name: '组件',
        json: exportedWidgets,
        activeKey: state.editorCtx.activeWidgetId,
      },
      {
        name: '操作',
        json: exportedOps,
        activeKey: state.editorCtx.activeOpId,
      },
    ],
  }
}
const AppModelBrowner = connect(
  mapStateToModelBrownerProps, 
)(ModelBrowser);

const mapStateToEditorCanvasProps = (state) => {
  return {
    widgets: state.widgets,
    activeWidgetId: state.editorCtx.activeWidgetId,
  }
}
const mapDispatchToEditorCanvasProps = (dispatch) => {
  const fire = wrapDispatchToFire(dispatch);
  return {
    onAddOrUpdate: (newWidget) => {
      fire(`${NS.widgets}/addOrUpdate`, {
        widget: newWidget,
      })
    },
    onDeleteOne: (widgetId) => {
      fire(`${NS.widgets}/deleteOne`, { widgetId, }) 
    },
    onWidgetDispatch: (widgetId, widgetAction) => {
      fire(`${NS.widgets}/updateContent`, {
        widgetId,
        widgetAction,
      })
    },
    onSetActiveWidgetId: (id) => {
      dispatch({
        type: `${NS.editorCtx}/${setActiveWidgetId}`,
        payload: id,
      });
    },
  }
}
const AppEditorCanvas = connect(
  mapStateToEditorCanvasProps, 
  mapDispatchToEditorCanvasProps,
)(EditorCanvas);

const mapStateToWidgetConfigPanelProps = (state) => {
  return {
    widget: state.widgets[state.editorCtx.activeWidgetId],
    widgets: state.widgets,
  }
}
const mapDispatchToWidgetConfigPanelProps = (dispatch) => {
  const fire = wrapDispatchToFire(dispatch);
  return {
    onWidgetDispatch: (widgetId, widgetAction) => {
      fire(`${NS.widgets}/updateContent`, {
        widgetId,
        widgetAction,
      })
    },
    onChangeWidgetId: (oldWidgetId, newWidgetId) => {
      fire(`${NS.widgets}/changeWidgetId`, {
        oldWidgetId,
        newWidgetId,
      })
    },
  };
};
const AppWidgetConfigPanel = connect(
  mapStateToWidgetConfigPanelProps, 
  mapDispatchToWidgetConfigPanelProps,
)(WidgetConfigPanel);

let DnDLayout = ({ activeWidgetId }) => {
  let rightSider;
  if (activeWidgetId) {
    rightSider = <AppWidgetConfigPanel /> 
  } else {
    rightSider = <WidgetPicker />
  }
  return (
    <Layout>
      <Layout>
        <Content className={styles.EditorCanvasContainer}>
          <AppEditorCanvas />
        </Content>
        <Content className={styles.OperationEditorContainer} >
          <AppOperationEditor />
        </Content>
      </Layout>
      <Sider className={styles.defaultBg} width={275} >
        {rightSider}
      </Sider>
    </Layout>
  )
}
DnDLayout = DragDropContext(HTML5Backend)(DnDLayout);

function EditorLayout({ activeWidgetId }) {
  return (
    <Layout style={{ height: '100vh' }}>
      <Header className={styles.defaultBg}>
        <ControPanel />
      </Header>
      <Layout style={{ height: '100%' }}>
        <Sider className={styles.defaultBg} width={275}>
          <AppModelBrowner />
        </Sider>
        <DnDLayout activeWidgetId={activeWidgetId} />
      </Layout>
    </Layout>
  )
}

const Editor = ({ widgets, activeWidgetId, operations, dispatch}) => {
  const [lastEvalEnv, setLastEvalEnv] = useState([]);

  useEffect(() => {
    const widgetTemplates = getToEvalTemplates(widgets);
    const widgetContext = getEvalContext(widgets);
    const opTemplates = opGetToEvalTemplates(operations);
    const opContext = opGetEvalContext(operations);
    const toEvalTemplates = [...widgetTemplates, ...opTemplates];
    const evalContext = {...widgetContext, ...opContext};
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

  return ( <EditorLayout activeWidgetId={activeWidgetId} />)
}

const mapStateToProps = (state) => {
  return {
    widgets: state.widgets,
    operations: state.operations,
    activeWidgetId: state.editorCtx.activeWidgetId,
  };
};
const AppEditor = connect(mapStateToProps)(Editor);

import * as demoApp  from './demoApp';
const App = ({ match, dispatch }) => {
  useEffect(() => {
    const { app } = match.params;
    console.log(`app initializing: ${app}`)
    demoApp.setUp(dispatch);

    return function cleanup() {
      console.log(`app un-initializing: ${app}`)
      demoApp.cleanUp(dispatch);
    };
  }, []);

  return ( <AppEditor />)
}
export default connect()(App);