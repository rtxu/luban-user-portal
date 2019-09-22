import React from 'react';
import { Collapse } from 'antd';
import PropTypes from 'prop-types';
import JSONTree from 'react-json-tree';

import WidgetBox from './WidgetBox';
import WidgetFactory from '../WidgetFactory';

function ModelBrowser({ widgets, selectedWidgetId }) {
  const { Panel } = Collapse;
  const widgetsJson = {};
  Object.keys(widgets).map((widgetId) => {
    const widget = widgets[widgetId];
    const exporter = WidgetFactory.getExportedState(widget.type);
    widgetsJson[widgetId] = exporter(widget.content);
  })
  const themes = [
    'apathy',
    'ashes',
    /*
    'atelier-dune',
    'atelier-forest',
    'atelier-heath',
    'atelier-lakeside',
    'atelier-seaside',
    */
    'bespin',
    'brewer',
    'bright',
    'chalk',
    'codeschool',
    'colors',
    'default',
    'eighties',
    'embers',
    'flat',
    'google',
    'grayscale',
    'greenscreen',
    'harmonic',
    'hopscotch',
    //'index',
    'isotope',
    'marrakesh',
    'mocha',
    'monokai',
    //'nicinabox',
    'ocean',
    'paraiso',
    'pop',
    'railscasts',
    'shapeshifter',
    'solarized',
    'summerfruit',
    'threezerotwofour',
    'tomorrow',
    'tube',
    'twilight',
  ]
  return (
    <Collapse
      defaultActiveKey={['1']}
      expandIconPosition='right'
      style={{height: '100%', overflow: 'auto'}}
    >
      <Panel header='组件' key='1' >
        {
          /* 选主题时临时使用
          themes.map((name) => {
            console.log(name);
            return (
              <div key={name}>
                <div>{name}</div>
                <JSONTree data={widgetsJson} theme={name} invertTheme={true} hideRoot={true} />
              </div>
            )
          })
          */
        }
        <div style={{margin: -16}}>
          <JSONTree data={widgetsJson} 
            theme={{
              extend: 'default',
              tree: {
                backgroundColor: '#fff',
              },
              // 配置 root 的一级节点样式
              nestedNode: ({ style }, keyPath, nodeType, expanded, expandable) => {
                // console.log({ style, keyPath, nodeType, expanded, expandable, })
                return ({
                  style: {
                    ...style,
                    backgroundColor: keyPath[0] === selectedWidgetId ? 'rgba(80, 127, 255, 0.1)': style.backgroundColor,
                  }
                })
              },
              // 配置 root 的一级节点的 children 的样式
              nestedNodeChildren: ({ style }, keyPath, nodeType, expanded, expandable) => {
                // console.log({ style, keyPath, nodeType, expanded, expandable, })
                return ({
                  style: {
                    ...style,
                    backgroundColor: keyPath[0] === selectedWidgetId ? 'rgba(80, 127, 255, 0.12)': style.backgroundColor,
                  },
                })
              }
            }}
            hideRoot={true} 
          />
        </div>
      </Panel>
    </Collapse>
  )
}

ModelBrowser.propTypes = {
  // fron editor
  selectedWidgetId: PropTypes.string,
  widgets: PropTypes.objectOf(PropTypes.shape(WidgetBox.propTypes)).isRequired,
}

export default ModelBrowser;