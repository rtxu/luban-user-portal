import {
  Button,
  Table,
  Typography,
  Modal,
  Form,
  Input,
  Menu,
  Icon,
  Breadcrumb,
  Radio,
  Drawer
} from "antd";
import React from "react";
import Link from "umi/link";
import { useState, useRef } from "react";

// @ts-ignore
import styles from "./index.less";
import useApps from "../../hooks/useApps";
import UserPortalLayout from "../../layouts/UserPortalLayout";
import withCurrentUserContext from "../../components/containers/withCurrentUserContext";

const Sider = () => {
  return (
    <Menu theme="dark" mode="inline" defaultSelectedKeys={["1"]}>
      <Menu.Item key="1">
        <Link to="/">
          <Icon type="appstore" style={{ fontSize: 14 }} />
          <span className="">应用</span>
        </Link>
      </Menu.Item>
    </Menu>
  );
};

const { Text } = Typography;

const AppOperation = ({ text, record, index, onDeleteApp }) => {
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
    <div className="flex justify-start">
      <div className="mr-4">
        <Button type="primary" icon="edit" href="/">
          编辑
        </Button>
      </div>
      <Button type="danger" icon="delete" onClick={handleDelete}>
        删除
      </Button>
    </div>
  );
};

const ALL_ICONS = {
  WEB_COMMON: [
    "account-book",
    "alert",
    "api",
    "appstore",
    "audio",
    "bank",
    "bell",
    "book",
    "bug",
    "bulb",
    "calculator",
    "build",
    "calendar",
    "camera",
    "car",
    "carry-out",
    "cloud",
    "code",
    "compass",
    "contacts",
    "container",
    "control",
    "credit-card",
    "crown",
    "customer-service",
    "dashboard",
    "database",
    "dislike",
    "environment",
    "experiment",
    "eye-invisible",
    "eye",
    "file-add",
    "file-excel",
    "file-exclamation",
    "file-image",
    "file-markdown",
    "file-pdf",
    "file-ppt",
    "file-text",
    "file-unknown",
    "file-word",
    "file-zip",
    "file",
    "filter",
    "fire",
    "flag",
    "folder-add",
    "folder",
    "folder-open",
    "frown",
    "funnel-plot",
    "gift",
    "hdd",
    "heart",
    "home",
    "hourglass",
    "idcard",
    "insurance",
    "interaction",
    "layout",
    "like",
    "lock",
    "mail",
    "medicine-box",
    "meh",
    "message",
    "mobile",
    "money-collect",
    "pay-circle",
    "notification",
    "phone",
    "picture",
    "play-square",
    "printer",
    "profile",
    "project",
    "pushpin",
    "property-safety",
    "read",
    "reconciliation",
    "red-envelope",
    "rest",
    "rocket",
    "safety-certificate",
    "save",
    "schedule",
    "security-scan",
    "setting",
    "shop",
    "shopping",
    "skin",
    "smile",
    "sound",
    "star",
    "switcher",
    "tablet",
    "tag",
    "tags",
    "tool",
    "thunderbolt",
    "trophy",
    "unlock",
    "usb",
    "video-camera",
    "wallet",
    "apartment",
    "audit",
    "barcode",
    "bars",
    "block",
    "border",
    "branches",
    "ci",
    "cloud-download",
    "cloud-server",
    "cloud-sync",
    "cloud-upload",
    "cluster",
    "coffee",
    "copyright",
    "deployment-unit",
    "desktop",
    "disconnect",
    "dollar",
    "download",
    "ellipsis",
    "euro",
    "exception",
    "export",
    "file-done",
    "file-jpg",
    "file-protect",
    "file-sync",
    "file-search",
    "fork",
    "gateway",
    "global",
    "gold",
    "history",
    "import",
    "inbox",
    "key",
    "laptop",
    "link",
    "line",
    "loading-3-quarters",
    "loading",
    "man",
    "menu",
    "monitor",
    "more",
    "number",
    "percentage",
    "paper-clip",
    "pound",
    "poweroff",
    "pull-request",
    "qrcode",
    "reload",
    "safety",
    "robot",
    "scan",
    "search",
    "select",
    "shake",
    "share-alt",
    "shopping-cart",
    "solution",
    "sync",
    "table",
    "team",
    "to-top",
    "trademark",
    "transaction",
    "upload",
    "user-add",
    "user-delete",
    "usergroup-add",
    "user",
    "usergroup-delete",
    "wifi",
    "woman"
  ]
};
function IconItem({ type, onClick }) {
  return (
    <div className="w-1/4 h-24" onClick={onClick}>
      <div className="flex flex-col items-center justify-center">
        <div className="mt-4 mb-2">
          <Icon type={type} style={{ fontSize: 32 }} />
        </div>
        <span className=" block text-center whitespace-no-wrap font-mono">
          {type}
        </span>
      </div>
    </div>
  );
}
function IconSelect({ value, onChange }) {
  const [visible, setVisible] = useState(false);

  function showDrawer() {
    setVisible(true);
  }
  function closeDrawer() {
    setVisible(false);
  }
  function onSelectIcon(type) {
    onChange(type);
    setVisible(false);
  }

  return (
    <>
      <Button icon={value} onClick={showDrawer}>
        {value ? null : "选择"}
      </Button>
      {value ? (
        <Button type="link" onClick={() => onChange(null)}>
          取消
        </Button>
      ) : null}
      <Drawer
        visible={visible}
        closable={false}
        onClose={closeDrawer}
        title="图标"
        width={512}
      >
        <div className="flex flex-wrap">
          {ALL_ICONS.WEB_COMMON.map(iconType => (
            <IconItem
              type={iconType}
              key={iconType}
              onClick={() => onSelectIcon(iconType)}
            />
          ))}
        </div>
      </Drawer>
    </>
  );
}
// Used to escape the following react warning:
// index.js:1 Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
class IconSelectClassComponent extends React.Component {
  render() {
    return <IconSelect {...this.props} />;
  }
}

const AppList = ({ apps, onDeleteApp, onChangeDescription }) => {
  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      className: styles.appColumn,
      render: (text, record, index) => (
        <Link to={`/app/${encodeURIComponent(record.name)}`}>
          {record.name}
        </Link>
      )
    },
    {
      title: "备注",
      dataIndex: "comment",
      key: "comment",
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

const NewAppForm = Form.create()(
  // WARNING: Form 不能是函数组件，会报错，暂不清楚原因，与实现细节有关
  class extends React.Component {
    render() {
      const { visible, onCancel, onCreate, form } = this.props;
      const { getFieldDecorator } = form;

      const formItemLayout = {
        labelCol: { span: 6 },
        wrapperCol: { span: 14 }
      };

      return (
        <Modal
          visible={visible}
          title="创建新应用"
          okText="创建"
          onCancel={onCancel}
          onOk={onCreate}
        >
          <Form layout="horizontal" {...formItemLayout}>
            <Form.Item label="类型">
              {getFieldDecorator("type", {
                rules: [{ required: true, message: "请选择类型" }],
                initialValue: "app"
              })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="app">应用</Radio.Button>
                  <Radio.Button value="directory">子菜单</Radio.Button>
                </Radio.Group>
              )}
            </Form.Item>
            <Form.Item label="名称">
              {getFieldDecorator("name", {
                rules: [{ required: true, message: "请输入名称" }]
              })(<Input />)}
            </Form.Item>
            <Form.Item label="图标">
              {getFieldDecorator("icon")(<IconSelectClassComponent />)}
            </Form.Item>
            <Form.Item label="备注">
              {getFieldDecorator("comment")(<Input type="textarea" />)}
            </Form.Item>
          </Form>
        </Modal>
      );
    }
  }
);

const Page = ({ match }) => {
  const [apps, { addApp, deleteApp, setAppDescription }] = useApps();
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

      addApp(values);
      form.resetFields();
      setVisible(false);
    });
  };

  const saveFormRef = form => {
    formRef.current = form;
  };

  const { firstLevelDir, secondLevelDir } = match.params;

  return (
    <UserPortalLayout sider={<Sider />}>
      <div className="m-16">
        <div className="my-4">
          <Breadcrumb>
            <Breadcrumb.Item href="/manage/">
              <Icon type="home" style={{ fontSize: "1.125rem" }} />
            </Breadcrumb.Item>
            {firstLevelDir ? (
              <Breadcrumb.Item href={`/manage/${firstLevelDir}`}>
                {/* [PASS] 中文可以么 ? */}
                <span className="text-lg">{firstLevelDir}</span>
              </Breadcrumb.Item>
            ) : null}
            {secondLevelDir ? (
              <Breadcrumb.Item
                href={`/manage/${firstLevelDir}/${secondLevelDir}`}
              >
                <span className="text-lg">{secondLevelDir}</span>
              </Breadcrumb.Item>
            ) : null}
          </Breadcrumb>
        </div>
        <AppList
          apps={apps}
          onDeleteApp={deleteApp}
          onChangeDescription={setAppDescription}
        />
        <div className={styles.appListOperationZone}>
          <Button type="primary" size="large" onClick={showModal}>
            新建
          </Button>
          <NewAppForm
            wrappedComponentRef={saveFormRef}
            visible={visible}
            onCancel={handleCancel}
            onCreate={handleCreate}
          />
        </div>
      </div>
    </UserPortalLayout>
  );
};

export default withCurrentUserContext(Page);
