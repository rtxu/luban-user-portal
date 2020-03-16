import React, { useContext } from "react";
import { Layout } from "antd";
import { DragDropContext } from "react-dnd";
import HTML5Backend from "react-dnd-html5-backend";

// @ts-ignore
import styles from "./index.less";

import ControlPanel from "../../../components/editor/ControlPanel";
import ModelBrowser from "../../../components/editor/ModelBrowser";
import EditorCanvas from "../../../components/editor/EditorCanvas";
import OperationEditor from "../../../components/editor/OperationEditor";
import WidgetPicker from "../../../components/editor/WidgetPicker";
import WidgetConfigPanel from "../../../components/editor/WidgetConfigPanel";

import withEditorContext, {
  EditorContext
} from "../../../components/containers/withEditorContext";
import withCurrentUserContext, {
  CurrentUserContext
} from "@/components/containers/withCurrentUserContext";
import AppLoader, { LoadType } from "@/components/containers/AppLoader";
import { buildAppMeta } from "@/pages/app/$app1/index";

const { Header, Sider, Content } = Layout;

let DnDLayout = () => {
  const [{ activeWidgetId }] = useContext(EditorContext);
  let rightSider;
  if (activeWidgetId) {
    rightSider = <WidgetConfigPanel />;
  } else {
    rightSider = <WidgetPicker />;
  }
  return (
    <Layout>
      <Layout>
        <Content className={styles.EditorCanvasContainer}>
          <EditorCanvas />
        </Content>
        <Content className={styles.OperationEditorContainer}>
          <OperationEditor />
        </Content>
      </Layout>
      <Sider className={styles.defaultBg} width={275}>
        {rightSider}
      </Sider>
    </Layout>
  );
};
DnDLayout = DragDropContext(HTML5Backend)(DnDLayout);

function EditorLayout() {
  return (
    <Layout style={{ height: "100vh" }}>
      <Header className={styles.defaultBg}>
        <ControlPanel />
      </Header>
      <Layout style={{ height: "100%" }}>
        <Sider className={styles.defaultBg} width={275}>
          <ModelBrowser />
        </Sider>
        <DnDLayout />
      </Layout>
    </Layout>
  );
}

function Page({ match }) {
  const { data: currentUser } = useContext(CurrentUserContext);
  const appMeta = buildAppMeta(match, currentUser);
  return (
    <AppLoader appMeta={appMeta} loadType={LoadType.Edit}>
      <EditorLayout />
    </AppLoader>
  );
}

export default withCurrentUserContext(withEditorContext(Page));
