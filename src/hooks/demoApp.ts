import alasql from "alasql";

import {
  initialState as operationsInitialState,
  initOperations
} from "../models/operations";
import {
  initialState as widgetsInitialState,
  initWidgets
} from "../models/widgets";

const demoInitialState = {
  widgets: {
    text1: {
      type: "text",
      gridWidth: 3,
      gridHeight: 1,
      gridTop: 1,
      gridLeft: 5,
      instanceId: 1,
      id: "text1",
      content: {
        isScrollWhenOverflow: false,
        isExpandWhenHover: false,
        valueInput: "客户表",
        value: null,
        valueError: null
      }
    },
    table1: {
      type: "table",
      gridWidth: 8,
      gridHeight: 8,
      gridTop: 3,
      gridLeft: 2,
      instanceId: 1,
      id: "table1",
      content: {
        dataInput: "{{op2.data}}",
        data: [],
        columns: [],
        lastValidColumns: [],
        height: 320,
        isCompact: false,
        selectedRowIndex: 0
      }
    },
    text_input1: {
      type: "text_input",
      gridWidth: 3,
      gridHeight: 1,
      gridTop: 2,
      gridLeft: 7,
      instanceId: 1,
      id: "text_input1",
      content: {
        label: "",
        labelMaxWidth: 150,
        input: {
          type: "text",
          value: "",
          placeholder: "请输入客户姓名"
        }
      },
      canvasColumnWidth: 89.41666666666667,
      showBorder: false,
      selected: true
    },
    button2: {
      type: "button",
      gridWidth: 2,
      gridHeight: 1,
      gridTop: 11,
      gridLeft: 8,
      instanceId: 2,
      id: "button2",
      content: {
        text: "标记为 VIP",
        color: "#1EA9FB",
        actionType: "触发<操作>",
        actionTriggerAnAction: {
          opId: "op4"
        },
        actionOpenAnyWebPage: {
          href: null,
          isOpenInNewTab: false
        }
      },
      canvasColumnWidth: 89.41666666666667,
      showBorder: false,
      selected: false
    },
    text2: {
      type: "text",
      gridWidth: 3,
      gridHeight: 1,
      gridTop: 13,
      gridLeft: 5,
      instanceId: 2,
      id: "text2",
      content: {
        isScrollWhenOverflow: false,
        isExpandWhenHover: false,
        valueInput: "客户 {{table1.selectedRow.data.name}} 的消费记录",
        value: null,
        valueError: null
      },
      canvasColumnWidth: 89.41666666666667,
      showBorder: false,
      selected: false
    },
    table2: {
      type: "table",
      gridWidth: 8,
      gridHeight: 8,
      gridTop: 14,
      gridLeft: 2,
      instanceId: 2,
      id: "table2",
      content: {
        dataInput: "{{op3.data}}",
        data: [],
        columns: [],
        lastValidColumns: [],
        height: 320,
        isCompact: false,
        selectedRowIndex: 0
      }
    }
  },
  operations: {
    op1: {
      id: "op1",
      type: "SQLReadonly",
      preparedSqlInput: "select * from customer;",
      preparedSql: null,
      preparedSqlError: null,
      execMode: "Auto",
      data: null,
      lastExecSql: null,
      error: null
    },
    op2: {
      id: "op2",
      type: "SQLReadonly",
      preparedSqlInput:
        "select * from {{op1.data}} where name like {{text_input1.value+'%'}}",
      preparedSql: null,
      preparedSqlError: null,
      execMode: "Auto",
      data: null,
      lastExecSql: null,
      error: null
    },
    op3: {
      id: "op3",
      type: "SQLReadonly",
      preparedSqlInput:
        "select * from trading_record where name = {{table1.selectedRow.data.name}}",
      preparedSql: null,
      preparedSqlError: null,
      execMode: "Auto",
      data: null,
      lastExecSql: null,
      error: null
    },
    op4: {
      id: "op4",
      type: "SQLReadWrite",
      preparedSqlInput:
        "update customer set isVIP = true where name = {{table1.selectedRow.data.name}}",
      preparedSql: null,
      preparedSqlError: null,
      execMode: "Manual",
      data: null,
      lastExecSql: null,
      error: null,
      opListWhenSuccess: ["op1"],
      opListWhenFail: []
    }
  }
};

const setUpLocalStorage = () => {
  // HELP(ruitao.xu): I DONOT know why cleanUp DOESNOT work when uninit app, so I re-cleanUp here
  cleanUpLocalStrorage();
  alasql(`
  CREATE LOCALSTORAGE DATABASE IF NOT EXISTS demo_db;
  ATTACH LOCALSTORAGE DATABASE demo_db;
  USE demo_db;
  `);
  alasql(`
  CREATE TABLE IF NOT EXISTS customer (
    name STRING PRIMARY KEY, 
    lastOrderDate STRING, 
    totalOrderCount INT,
    isVIP BOOL 
  );
  `);
  alasql(`
  CREATE TABLE IF NOT EXISTS trading_record (
    id INT PRIMARY KEY, 
    name STRING, 
    orderDate STRING, 
    orderFee INT
  );
  `);

  const customerNames = ["张经理", "王工程师", "李主任", "赵客服"];
  alasql(
    "INSERT INTO customer VALUES (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?), (?, ?, ?, ?)",
    [
      customerNames[0],
      "2019-07-01",
      3,
      false,
      customerNames[1],
      "2019-08-07",
      5,
      false,
      customerNames[2],
      "2019-09-05",
      8,
      false,
      customerNames[3],
      "2019-10-08",
      7,
      false
    ]
  );

  let tradingRecordId = 0;
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[0],
    "2019-06-01",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[0],
    "2019-06-02",
    200
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[0],
    "2019-07-01",
    300
  ]);

  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[1],
    "2019-06-01",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[1],
    "2019-07-01",
    200
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[1],
    "2019-08-01",
    400
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[1],
    "2019-08-02",
    800
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[1],
    "2019-08-07",
    1600
  ]);

  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-01-05",
    1600
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-02-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-03-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-04-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-05-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-06-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-07-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[2],
    "2019-09-05",
    100
  ]);

  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-01",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-02",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-03",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-04",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-05",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-06",
    100
  ]);
  alasql("INSERT INTO trading_record VALUES (?, ?, ?, ?)", [
    tradingRecordId++,
    customerNames[3],
    "2019-10-08",
    100
  ]);
};

const cleanUpLocalStrorage = () => {
  alasql(` ATTACH LOCALSTORAGE DATABASE demo_db; `);
  alasql(` DROP TABLE IF EXISTS demo_db.customer; `);
  alasql(` DROP TABLE IF EXISTS demo_db.trading_record; `);
  alasql(` DROP LOCALSTORAGE DATABASE IF EXISTS demo_db; `);
};

export const setUp = dispatch => {
  setUpLocalStorage();
  dispatch(initWidgets(demoInitialState.widgets));
  dispatch(initOperations(demoInitialState.operations));
};
export const cleanUp = dispatch => {
  dispatch(initWidgets(widgetsInitialState));
  dispatch(initOperations(operationsInitialState));
  cleanUpLocalStrorage();
};
