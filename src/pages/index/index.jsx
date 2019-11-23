import React, { useState, useRef, useEffect } from "react";
import { Button, Table, Typography, Modal, Form, Input } from "antd";
import Link from "umi/link";
import { connect } from "dva";

// @ts-ignore
import styles from "./index.less";
import { addApp, deleteApp, loadApps, setAppDescription } from "./models/apps";

const { Text } = Typography;

const AppOperation = ({
  text,
  record,
  index,
  onDeleteApp,
  onChangeDescription
}) => {
  const handleDelete = () => {
    Modal.confirm({
      title: `确定要删除 ${record.name} 吗？`,
      okText: "删除",
      okType: "danger",
      cancelText: "取消",
      onOk() {
        onDeleteApp(record.name);
      },
      onCancel() {}
    });
  };
  return (
    <div>
      {/**
      <Link to={`/app/${encodeURIComponent(record.name)}`}>
        <Button icon="eye">查看</Button>
      </Link>
      */}
      <Link to={`/editor/${encodeURIComponent(record.name)}`}>
        <Button icon="edit">编辑</Button>
      </Link>
      <Button type="danger" icon="delete" onClick={handleDelete}>
        删除
      </Button>
    </div>
  );
};

const AppList = ({ apps, onDeleteApp, onChangeDescription }) => {
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      className: styles.appColumn
    },
    {
      title: "描述",
      dataIndex: "description",
      key: "description",
      className: styles.appColumn,
      render: (text, record, index) => (
        <Text
          editable={{
            onChange: newValue => {
              onChangeDescription(record.name, newValue);
            }
          }}
        >
          {text}
        </Text>
      )
    },
    {
      title: "操作",
      key: "operation",
      className: styles.appColumn,
      render: (text, record, index) => (
        <AppOperation
          text={text}
          record={record}
          index={index}
          onDeleteApp={onDeleteApp}
        />
      )
    }
  ];

  let data = [];
  for (const app of Object.values(apps)) {
    data.push({ key: app.name, name: app.name, description: app.description });
  }

  return (
    <div className={styles.appList}>
      <Table
        columns={columns}
        dataSource={data}
        pagination={{
          simple: true,
          hideOnSinglePage: true,
          pageSize: 5
        }}
        size="default"
        //rowClassName={styles.appRow}
      />
    </div>
  );
};

const CreateAppForm = Form.create()(
  // WARNING: Form 不能是函数组件，会报错，暂不清楚原因，与实现细节有关
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      return (
        <Modal
          visible={visible}
          title="创建新应用"
          okText="创建"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="vertical">
            <Form.Item label="名称">
              {getFieldDecorator("name", {
                rules: [{ required: true, message: "请输入应用名称" }]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="描述">
              {getFieldDecorator("description")(<Input type="textarea" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

const Index = ({
  apps,
  onAddApp,
  onDeleteApp,
  initApps,
  onChangeDescription
}) => {
  const [visible, setVisible] = useState(false);
  const formRef = useRef(null);
  const showModal = () => {
    setVisible(true);
  };
  const handleCancel = () => {
    setVisible(false);
  };
  const handleCreate = () => {
    const { form } = formRef.current.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      if (values.name in apps) {
        form.setFields({
          name: {
            value: values.name,
            errors: [new Error(`应用「${values.name}」已存在`)]
          }
        });
        return;
      }

      onAddApp(values);
      form.resetFields();
      setVisible(false);
    });
  };

  const saveFormRef = form => {
    formRef.current = form;
  };

  useEffect(() => {
    initApps();
  }, []);

  return (
    <div className={styles.container}>
      <h2>应用列表</h2>
      <AppList
        apps={apps}
        onDeleteApp={onDeleteApp}
        onChangeDescription={onChangeDescription}
      />
      <div className={styles.appListOperationZone}>
        <Button type="primary" size="large" onClick={showModal}>
          新建
        </Button>
        <CreateAppForm
          wrappedComponentRef={saveFormRef}
          visible={visible}
          onCancel={handleCancel}
          onCreate={handleCreate}
        />
      </div>
    </div>
  );
};

const mapStateToProps = state => {
  return {
    apps: state.apps
  };
};
const mapDispatchToProps = dispatch => {
  return {
    initApps: () => {
      dispatch(loadApps());
    },
    onAddApp: payloads => {
      dispatch(addApp(payloads));
    },
    onDeleteApp: appName => {
      dispatch(deleteApp(appName));
    },
    onChangeDescription: (name, description) => {
      dispatch(setAppDescription({ name, description }));
    }
  };
};
export default connect(mapStateToProps, mapDispatchToProps)(Index);
