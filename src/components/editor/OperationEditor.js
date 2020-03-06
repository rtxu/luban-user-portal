import React, { useState, useEffect, useContext } from "react";
import {
  Select,
  TreeSelect,
  Tabs,
  Icon,
  Button,
  Drawer,
  Table,
  notification
} from "antd";
import alasql from "alasql";

import myStyles from "./OperationEditor.less";
alasql.options.errorlog = true;
import { assert } from "../../util";
import CmEvalInput from "../CmEvalInput";
import { AppContext } from "../containers/AppContextProvider";
import { EditorContext } from "../containers/withEditorContext";

function runSql(statement) {
  console.log("run sql: ", statement);
  return alasql(statement);
}

function OpTabBar({ ops, activeOpId, newOperationButton }) {
  const [, { setActiveOpId }] = useContext(EditorContext);
  return (
    <div className={myStyles.opNaviBar}>
      <div className={myStyles.tabContainer}>
        <div className={myStyles.override}>
          <Tabs
            activeKey={activeOpId}
            type="card"
            onChange={activeKey => {
              setActiveOpId(activeKey);
            }}
          >
            {ops.map(i => (
              <Tabs.TabPane tab={i} key={i} />
            ))}
          </Tabs>
        </div>
      </div>
      <div className={myStyles.actions}>
        {newOperationButton}
        {/* TODO: better to have
        <Input placeholder="快速打开" />
        */}
      </div>
    </div>
  );
}

function TargetDetail({ target, visible, setVisible }) {
  function listLocalStorageTable() {
    const tables = runSql("show tables;");
    if (tables) {
      return tables.map(table => table.tableid);
    } else {
      return [];
    }
  }

  function listLocalStorageTableColumn(table) {
    // FIXME(ruitao.xu): I DONOT know why, but it works
    // if no select statement, show columns statement return empty list
    runSql(`select * from ${table};`);
    const columns = runSql(`show columns from ${table};`);
    if (columns) {
      //console.log(`show columns from ${table}`, columns);
      return columns.map(col => ({
        key: col.columnid,
        column_name: col.columnid,
        data_type: col.dbtypeid
      }));
    } else {
      return [];
    }
  }

  useEffect(() => {
    const [scope, dbName] = target.split(".");
    assert(scope === "localStorage");
    runSql(`
      ATTACH LOCALSTORAGE DATABASE ${dbName};
      USE ${dbName};
    `);
  }, [target]);

  const tbls = listLocalStorageTable();
  const columns = [
    {
      title: "列名",
      dataIndex: "column_name",
      key: "column_name"
    },
    {
      title: "数据类型",
      dataIndex: "data_type",
      key: "data_type"
    }
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
      {tbls.map(table => (
        <div key={table} style={{ marginBottom: 16 }}>
          <h4>表名: {table}</h4>
          <Table
            dataSource={listLocalStorageTableColumn(table)}
            columns={columns}
            pagination={false}
          />
        </div>
      ))}
    </Drawer>
  );
}

function NormalOpHeader({ op }) {
  // console.log('current op in header: ', op);
  const [, { deleteOperation, execOperation, setOperationType }] = useContext(
    EditorContext
  );
  const [target, setTarget] = useState();
  const [targetDetailVisible, setTargetDetailVisible] = useState(false);
  function listLocalStorageDb() {
    const dbJson = localStorage.getItem("alasql");
    const dbMap = JSON.parse(dbJson);
    const dbs = Object.keys(dbMap["databases"]);
    return dbs;
  }

  const dbs = listLocalStorageDb();
  const treeData = [
    {
      title: "localStorage",
      selectable: false,
      value: "localStorage",
      key: "localStorage",
      children: []
    }
  ];
  treeData[0].children = dbs.map(db => ({
    title: `${db}`,
    value: `localStorage.${db}`,
    key: `localStorage.${db}`
  }));

  return (
    <>
      <div className={myStyles.left}>
        <label>
          类型：
          <Select
            defaultValue="SQLReadonly"
            value={op.type}
            style={{ width: 200 }}
            onChange={value => setOperationType(op.id, value)}
          >
            <Select.Option value="SQLReadonly">SQL(只读)</Select.Option>
            <Select.Option value="SQLReadWrite">SQL(读写)</Select.Option>
          </Select>
        </label>
        <label>
          数据库：
          <TreeSelect
            style={{ width: 200 }}
            value={target}
            dropdownStyle={{ maxHeight: 400, overflow: "auto" }}
            treeData={treeData}
            placeholder="选择数据库"
            treeDefaultExpandAll
            onChange={newTarget => setTarget(newTarget)}
            allowClear
          />
        </label>
        {target ? (
          <Button
            type="link"
            onClick={() => {
              if (target) {
                setTargetDetailVisible(true);
              }
            }}
          >
            详情
          </Button>
        ) : null}
        {target ? (
          <TargetDetail
            target={target}
            visible={targetDetailVisible}
            setVisible={setTargetDetailVisible}
          />
        ) : null}
      </div>
      <div className={myStyles.right}>
        <Button
          type="danger"
          onClick={() => {
            deleteOperation(op.id);
          }}
        >
          删除
        </Button>
        {/* <Button>格式化</Button> */}
        {/* <Button>复制</Button> */}
        {/* <Button disabled>保存</Button> */}
        <Button
          type="primary"
          onClick={() => {
            if (op.preparedSqlError) {
              notification.error({
                message: "输入不合法"
              });
            } else if (op.preparedSqlInput === "") {
              notification.info({
                message: "输入为空"
              });
            } else {
              execOperation(op.id);
            }
          }}
        >
          运行
        </Button>
      </div>
    </>
  );
}

function EmptyOpHeader() {
  return null;
}

function OpHeader({ op }) {
  return (
    <div className={myStyles.opHeader}>
      {op ? <NormalOpHeader op={op} /> : <EmptyOpHeader />}
    </div>
  );
}

function AfterExecute({ op, opNames }) {
  const [, { setOpListWhenSuccess, setOpListWhenFail }] = useContext(
    EditorContext
  );
  const otherOpNames = opNames.filter(opId => op.id !== opId);
  return (
    <>
      <h5>执行完成后</h5>
      <div className={myStyles.afterExec}>
        <div className={myStyles.left}>
          <p>如果成功，执行如下操作</p>
          <Select
            defaultValue={op.opListWhenSuccess}
            style={{ width: "100%" }}
            onChange={value => {
              if (value === "") {
                // do nothing
              } else {
                setOpListWhenSuccess(op.id, value.split(","));
              }
            }}
          >
            {otherOpNames.map(opId => (
              <Select.Option value={opId} key={opId}>
                {opId}
              </Select.Option>
            ))}
          </Select>
        </div>
        <div className={myStyles.right}>
          <p>如果失败，执行如下操作</p>
          <Select
            defaultValue={op.opListWhenFail}
            style={{ width: "100%" }}
            onChange={value => {
              if (value === "") {
                // do nothing
              } else {
                setOpListWhenFail(op.id, value.split(","));
              }
            }}
          >
            {otherOpNames.map(opId => (
              <Select.Option value={opId} key={opId}>
                opId
              </Select.Option>
            ))}
          </Select>
        </div>
      </div>
    </>
  );
}

function NormalOpBody({ op, opNames }) {
  const [, { setOperationInput }] = useContext(EditorContext);
  return (
    <div className={myStyles.normalOpBody}>
      <section>
        <CmEvalInput
          value={op.preparedSqlInput}
          options={{
            mode: "sql",
            theme: "neo",
            lineWrapping: true,
            lineNumbers: true,
            viewportMargin: Infinity
          }}
          onChange={newValue => {
            setOperationInput(op.id, newValue);
          }}
        />
      </section>
      <section>
        <hr />
        {op.type === "SQLReadWrite" ? (
          <AfterExecute op={op} opNames={opNames} />
        ) : null}
      </section>
      {/* 
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
  );
}

function EmptyOpBody({ newOperationButton }) {
  return (
    <div className={myStyles.emptyOpBody}>
      <div className={myStyles.icon}>
        <Icon
          type="appstore"
          theme={"filled"}
          style={{ fontSize: 72, color: "" }}
        />
      </div>
      <h4>未选中任何操作</h4>
      <div className={myStyles.description}>
        {newOperationButton}
        一个操作 或 选择已有操作
      </div>
    </div>
  );
}

function OpBody({ op, opNames, newOperationButton }) {
  return (
    <>
      {op ? (
        <NormalOpBody op={op} opNames={opNames} />
      ) : (
        <EmptyOpBody newOperationButton={newOperationButton} />
      )}
    </>
  );
}

function OperationEditor({}) {
  const [{ operations }] = useContext(AppContext);
  const [{ activeOpId }, { addOperation, setActiveOpId }] = useContext(
    EditorContext
  );
  const opNames = Object.keys(operations);
  const activeOp = operations[activeOpId];

  function generateNewOpId(ops) {
    let instanceId = ops.length + 1;
    while (ops.includes(`op${instanceId}`)) {
      instanceId++;
    }
    return `op${instanceId}`;
  }
  const myOnAddOperation = () => {
    const newOpId = generateNewOpId(opNames);
    addOperation(newOpId);
    setActiveOpId(newOpId);
  };
  const myOnDeleteOperation = id => {
    deleteOperation(id);
    setActiveOpId(null);
  };
  const newOperationButton = (
    <Button onClick={myOnAddOperation}>
      <Icon type="plus" />
      新建
    </Button>
  );
  return (
    <div className={myStyles.opEditor}>
      <OpTabBar
        ops={opNames}
        activeOpId={activeOp ? activeOp.id : null}
        newOperationButton={newOperationButton}
      />
      <OpHeader op={activeOp} />
      <OpBody
        op={activeOp}
        opNames={opNames}
        newOperationButton={newOperationButton}
      />
    </div>
  );
}

export default OperationEditor;
