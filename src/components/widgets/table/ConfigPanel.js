import React from 'react';
import { Collapse, } from "antd";

import { setTemplateOfData, toggleColumnVisibility, moveColumn, setIsCompact } from './reducer';
import styles from './Widget.less';
import ColumnCollapse from './ColumnCollapse';
import Config from '../Config';

const { Panel } = Collapse;

export function ColumnCollapseContainer({ children }) {
  return (
    <div className={styles.removeBottomPadding} >
      {children}
    </div>
  )
}

function ConfigPanel(props) {
  const { rawInput, rawInputEvalResult, columns, dispatch, isCompact } = props;

  return (
    <Collapse
      defaultActiveKey={['1', '2', '3']}
      expandIconPosition='right'
    >
      <Panel header='内容' key='1' >
        <Config.LabelCmInput 
          label={{ value: '数据', }}
          input={{ 
            value: rawInput, 
            evalResult: rawInputEvalResult,
            // ref: https://github.com/scniro/react-codemirror2
            onBeforeChange: (editor, data, newValue) => {
              dispatch(setTemplateOfData(newValue));
            },
          }}
        />
        <Config.Switch 
          checked={isCompact} 
          onChange={(checked) => dispatch(setIsCompact(checked))}
          description='紧凑模式' 
        />
      </Panel>
      <Panel header='列选项' key='2' >
        <Config.Label value='单列选项' />
        <ColumnCollapseContainer>
          {
            columns.map((column, index) => (
              <ColumnCollapse 
                key={column.config.dataIndex}
                name={column.config.dataIndex} 
                index={index}
                visible={column.meta.visible}
                visibleOnClick={(index, event) => {
                  dispatch(toggleColumnVisibility(index));
                  event.stopPropagation();
                }}
                moveColumn={(from, to) => {
                  dispatch(moveColumn({from, to}));
                }}
              />
            ))
          }
        </ColumnCollapseContainer>
      </Panel>
    </Collapse>
  );
}

export default ConfigPanel;