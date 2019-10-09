import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { 
  Select, 
  TreeSelect,
  Tabs, 
  Icon, 
  Button, 
  Drawer,
  Table,
  notification,
} from 'antd';
import alasql from 'alasql';

import myStyles from './OperationEditor.less';
alasql.options.errorlog = true;
import { assert } from '../../util';
import CmEvalInput from '../CmEvalInput';

function runSql(statement) {
  console.log('run sql: ', statement)
  return alasql(statement);
}

function asyncRunSql(statement) {
  console.log('async run sql: ', statement)
  return alasql.promise(statement);
}

function OpTabBar({ ops, activeOpId, dispatch }) {
  return (
    <div className={myStyles.opNaviBar}>
      <div className={myStyles.tabContainer}>
        <div className={myStyles.override}>
          <Tabs activeKey={activeOpId} type='card' 
            onChange={(activeKey) => {
              dispatch({type: 'operations/setActive', payload: activeKey})
            }}>
            {ops.map((i) => (
              <Tabs.TabPane tab={i} key={i} />
            ))}
          </Tabs>
        </div>
      </div>
      <div className={myStyles.actions}>
          <Button onClick={() => {
              dispatch({type: 'operations/add'})
            }}>
            <Icon type="plus" />新建
          </Button>
          {/* TODO: better to have
          <Input placeholder="快速打开" />
          */}
      </div>
    </div>
  )
}

function TargetDetail({ target, visible, setVisible }) {
  function listLocalStorageTable() {
    const tables = runSql('show tables;');
    if (tables) {
      return tables.map((table) => table.tableid)
    } else {
      return []
    }
  }

  function listLocalStorageTableColumn(table) {
    // FIXME(ruitao.xu): I DONOT know why, but it works
    // if no select statement, show columns statement return empty list
    runSql(`select * from ${table};`);
    const columns = runSql(`show columns from ${table};`);
    if (columns) {
      //console.log(`show columns from ${table}`, columns);
      return columns.map((col) => ({
        key: col.columnid,
        column_name: col.columnid,
        data_type: col.dbtypeid,
      }))
    } else {
      return []
    }
  }

  useEffect(() => {
    const [scope, dbName] = target.split('.');
    assert(scope === 'localStorage');
    runSql(`
      ATTACH LOCALSTORAGE DATABASE ${dbName};
      USE ${dbName};
    `);
  }, [target])

  const tbls = listLocalStorageTable();
  const columns = [
    {
      title: '列名',
      dataIndex: 'column_name',
      key: 'column_name',
    },
    {
      title: '数据类型',
      dataIndex: 'data_type',
      key: 'data_type',
    },
  ];

  return (
    <Drawer
        title="数据库详情"
        placement="right"
        closable={false}
        onClose={() => setVisible(false)}
        visible={visible}
        width={300}
      >
        {
          tbls.map((table) => (
            <div key={table} style={{marginBottom: 16}}>
              <h4>表名: {table}</h4>
              <Table dataSource={listLocalStorageTableColumn(table)} columns={columns} pagination={false} />
            </div>
          ))
        }
    </Drawer>
  )
}

function NormalOpHeader({op, dispatch}) {
  console.log('current op in header: ', op);
  const [target, setTarget] = useState();
  const [targetDetailVisible, setTargetDetailVisible] = useState(false);
  function listLocalStorageDb() {
    const dbJson = localStorage.getItem('alasql');
    const dbMap = JSON.parse(dbJson);
    const dbs = Object.keys(dbMap['databases'])
    return dbs;
  }

  const dbs = listLocalStorageDb();
  const treeData = [
    {
      title: 'localStorage',
      selectable: false,
      value: 'localStorage',
      key: 'localStorage',
      children: [ ],
    },
  ];
  treeData[0].children = dbs.map((db) => ({
    title: `${db}`,
    value: `localStorage.${db}`,
    key: `localStorage.${db}`,
  }))

  return (
    <>
    <div className={myStyles.left}>
      <label>类型：
        <Select defaultValue="SQL_readonly" style={{ width: 200 }} >
          <Select.Option value="SQL_readonly">SQL(只读)</Select.Option>
          <Select.Option value="SQL_readwrite">SQL(读写)</Select.Option>
        </Select>
      </label>
      <label>数据库：
        <TreeSelect 
          style={{ width: 200 }} 
          value={target}
          dropdownStyle={{ maxHeight: 400, overflow: 'auto' }}
          treeData={treeData}
          placeholder="选择数据库"
          treeDefaultExpandAll
          onChange={(newTarget) => setTarget(newTarget)}
          allowClear
        />
      </label>
      { target ? (
        <Button type='link' onClick={() => {
          if (target) {
            setTargetDetailVisible(true)
          }
        }}>详情</Button>
      ): null}
      {
        target ? (
          <TargetDetail target={target} 
            visible={targetDetailVisible} 
            setVisible={setTargetDetailVisible} />
        ) : null
      }
    </div>
    <div className={myStyles.right}>
      <Button type='danger' onClick={() => {
        dispatch({type: 'operations/delete', payload: op.id});
      }}>删除</Button>
      {/* <Button>格式化</Button> */}
      {/* <Button>复制</Button> */}
      {/* <Button disabled>保存</Button> */}
      <Button type='primary' onClick={() => {
        if (op.template) {
          asyncRunSql(op.template)
            .then((data) => {
              dispatch({type: 'operations/setData', payload: {
                id: op.id,
                data,
              }})
            }).catch((e) => {
              notification.error({
                message: e.name,
                description: e.message,
              });
            });
        } else {
          notification.info({
            message: '输入为空',
          });
        }
      }}>运行</Button>
    </div>
    </>
  )
}

function EmptyOpHeader() {
  return null;
}

function OpHeader({op, dispatch}) {
  return (
    <div className={myStyles.opHeader}>
      {op ? <NormalOpHeader op={op} dispatch={dispatch} /> : <EmptyOpHeader />}
    </div>
  )
}

function NormalOpBody({op, dispatch}) {
  return (
    <div className={myStyles.normalOpBody}>
      <section>
        <CmEvalInput
          value={op.template}
          options={{
            mode: 'sql',
            theme: 'neo',
            lineWrapping: true,
            lineNumbers: true,
            viewportMargin: Infinity,
          }}
          onChange={(newValue) => {
            dispatch({
              type: 'operations/setTemplate', 
              payload: {
                id: op.id,
                template: newValue,
              }
            })
          }}
        />
      </section>
      {/* 
      <section>
        <h5>执行完成后</h5>
        <div>
          <div className={myStyles.left}>
            <p>如果成功，执行如下操作</p>
          </div>
          <div className={myStyles.right}>
            <p>如果失败，执行如下操作</p>
          </div>
        </div>
        <hr/>
      </section>
      <section>
        <h5>时间配置</h5>
        <hr/>
      </section>
      <section>
        <h5>高级选项</h5>
        <hr/>
      </section>
      */}
    </div>
  )
}

function EmptyOpBody({ dispatch }) {
  return (
    <div className={myStyles.emptyOpBody}>
      <div className={myStyles.icon}>
        <Icon type="appstore" theme={'filled'} style={{fontSize: 72, color: ''}} />
      </div>
      <h4>未选中任何操作</h4>
      <div className={myStyles.description}>
          <Button onClick={() => {
              dispatch({type: 'operations/add'})
            }}>
            <Icon type="plus" />新建
          </Button>
        一个操作 或 选择已有操作
      </div>
    </div>
  )
}

function OpBody({op, dispatch}) {
  return (
    <> {op ? <NormalOpBody op={op} dispatch={dispatch} /> : <EmptyOpBody dispatch={dispatch} />} </>
  )
}

function OperationEditor({ opMap, activeOpId, dispatch }) {
  return (
    <div className={myStyles.opEditor}>
      <OpTabBar 
        ops={Object.keys(opMap)} 
        activeOpId={activeOpId}
        dispatch={dispatch}
      />
      <OpHeader op={opMap[activeOpId]} dispatch={dispatch} />
      <OpBody op={opMap[activeOpId]} dispatch={dispatch} />
    </div>
  )
}

const op = {};
op.propTypes = {
  id: PropTypes.string.isRequired,
}

OperationEditor.propTypes = {
  opMap: PropTypes.objectOf(PropTypes.shape(op.propTypes)).isRequired,
  activeOpId: PropTypes.string,

  dispatch: PropTypes.func.isRequired,
}

export default OperationEditor;