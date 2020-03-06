import React, { useContext, useMemo } from "react";
import { Collapse } from "antd";
import JSONTree from "react-json-tree";

import { AppContext } from "../containers/AppContextProvider";
import { EditorContext } from "../containers/withEditorContext";
import { getExportedState as opGetExportedState } from "../../models/operations";
import { getExportedState } from "../../models/widgets";

function MyJsonTree({ json, activeKey }) {
  return (
    <div style={{ margin: -16 }}>
      <JSONTree
        data={json}
        theme={{
          extend: "default",
          tree: {
            backgroundColor: "#fff"
          },
          // 配置 root 的一级节点样式
          nestedNode: ({ style }, keyPath, nodeType, expanded, expandable) => {
            // console.log({ style, keyPath, nodeType, expanded, expandable, })
            return {
              style: {
                ...style,
                // keyPath[0] 为 json 的一级子节点的 key
                backgroundColor:
                  keyPath[0] === activeKey
                    ? "rgba(80, 127, 255, 0.1)"
                    : style.backgroundColor
              }
            };
          },
          // 配置 root 的一级节点的 children 的样式
          nestedNodeChildren: (
            { style },
            keyPath,
            nodeType,
            expanded,
            expandable
          ) => {
            // console.log({ style, keyPath, nodeType, expanded, expandable, })
            return {
              style: {
                ...style,
                backgroundColor:
                  keyPath[0] === activeKey
                    ? "rgba(80, 127, 255, 0.12)"
                    : style.backgroundColor
              }
            };
          }
        }}
        hideRoot={true}
      />
    </div>
  );
}

function ModelGroup({ json, activeKey }) {
  const node =
    Object.keys(json).length === 0 ? (
      <div>当前无数据</div>
    ) : (
      <MyJsonTree json={json} activeKey={activeKey} />
    );
  return node;
}

function useModelGroups() {
  const [{ widgets, operations }] = useContext(AppContext);
  const [{ activeWidgetId, activeOpId }] = useContext(EditorContext);
  const exportedWidgets = getExportedState(widgets);
  const exportedOps = opGetExportedState(operations);

  return useMemo(
    () => [
      {
        name: "组件",
        json: exportedWidgets,
        activeKey: activeWidgetId
      },
      {
        name: "操作",
        json: exportedOps,
        activeKey: activeOpId
      }
    ],
    [exportedWidgets, exportedOps, activeWidgetId, activeOpId]
  );
}

function ModelBrowser({}) {
  const themes = [
    "apathy",
    "ashes",
    /*
    'atelier-dune',
    'atelier-forest',
    'atelier-heath',
    'atelier-lakeside',
    'atelier-seaside',
    */
    "bespin",
    "brewer",
    "bright",
    "chalk",
    "codeschool",
    "colors",
    "default",
    "eighties",
    "embers",
    "flat",
    "google",
    "grayscale",
    "greenscreen",
    "harmonic",
    "hopscotch",
    //'index',
    "isotope",
    "marrakesh",
    "mocha",
    "monokai",
    //'nicinabox',
    "ocean",
    "paraiso",
    "pop",
    "railscasts",
    "shapeshifter",
    "solarized",
    "summerfruit",
    "threezerotwofour",
    "tomorrow",
    "tube",
    "twilight"
  ];
  const modelGroups = useModelGroups();
  const defaultActiveKey = [];
  for (let i = 0; i < modelGroups.length; i++) {
    if (Object.keys(modelGroups[i].json).length === 0) {
      // ignore
    } else {
    }
    defaultActiveKey.push(`${i}`);
  }
  return (
    <Collapse
      defaultActiveKey={defaultActiveKey}
      expandIconPosition="right"
      style={{ height: "100%", overflow: "auto" }}
    >
      {/* 选主题时临时使用
      <Panel header='组件' key='1' >
          themes.map((name) => {
            console.log(name);
            return (
              <div key={name}>
                <div>{name}</div>
                <JSONTree data={widgetsJson} theme={name} invertTheme={true} hideRoot={true} />
              </div>
            )
          })
        }
      </Panel>
      */}

      {modelGroups.map((group, index) => (
        <Collapse.Panel header={group.name} key={index}>
          <ModelGroup {...group} />
        </Collapse.Panel>
      ))}
    </Collapse>
  );
}

export default ModelBrowser;
