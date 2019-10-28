import React from "react";
import { Button, Table, Typography } from 'antd';
import Link from 'umi/link';

// @ts-ignore
import styles from './index.less';

const { Text } = Typography;

const AppOperation = ({text, record, index}) => {
  return (
    <div>
      <Button icon='eye' >查看</Button>
      <Link to={`/editor/${encodeURIComponent(record.app)}`}>
        <Button icon='edit' >编辑</Button>
      </Link>
      <Button type='danger' icon='delete' >删除</Button>
    </div>
  )
}

const AppList = ({}) => {
  function onDescriptionChange(newDescription) {
    // TODO(ruitao.xu):
    console.log(newDescription);
  }
  const columns = [
    { title: '名称', dataIndex: 'app', key: 'app', className: styles.appColumn },
    { title: '描述', dataIndex: 'description', key: 'description', className: styles.appColumn,
      render: (text, record, index) => <Text editable={{onChange: onDescriptionChange}}>{text}</Text>
    },
    { title: '操作', key: 'operation', className: styles.appColumn,
      render: (text, record, index) => (<AppOperation text={text} record={record} index={index} />),
    },
  ]

  const data = [
    { key: '1', app: 'App#1', description: '这是 App#1'},
    { key: '2', app: 'App#2', description: '这是 App#2'},
    { key: '3', app: 'App#3', description: '这是 App#3'},
  ];

  return (
    <div className={styles.appList}>
      <Table 
        columns={columns} 
        dataSource={data} 
        pagination={{
          simple: true,
          hideOnSinglePage: true,
        }}
        size='default'
        //rowClassName={styles.appRow}
      />
    </div>
  )
}

const Index = ({}) => {
  return (
    <div className={styles.container}>
      <h2>应用列表</h2>
      <AppList />
      <div className={styles.appListOperationZone}>
        <Button type='primary' size='large'>新建</Button>
      </div>
    </div>
  )
}

export default Index; 