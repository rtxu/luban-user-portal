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
  Spin,
  message
} from "antd";
import React, { useContext, useState, useRef } from "react";
import Link from "umi/link";
import { Redirect } from "react-router";
import { trigger } from "swr";

import IconSelectDrawer from "@/components/IconSelectDrawer";
// @ts-ignore
import UserPortalLayout from "@/layouts/UserPortalLayout";
import withCurrentUserContext, {
  CurrentUserContext
} from "@/components/containers/withCurrentUserContext";
import {
  findDir,
  EntryType,
  EntryBase,
  isDir
} from "@/hooks/useSWRCurrentUser";
import { SWRKey, lubanApiRequest, makeJsonBody } from "@/hooks/common";
import ServerErrCode from "@/util/serverErrCode";

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

const AppOperation = ({ text, record, index, onDeleteApp, dir }) => {
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
        <Link to={`/edit${dir}${encodeURIComponent(record.name)}`}>
          <Button type="primary" icon="edit">
            编辑
          </Button>
        </Link>
      </div>
      <Button type="danger" icon="delete" onClick={handleDelete}>
        删除
      </Button>
    </div>
  );
};

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
      <IconSelectDrawer
        visible={visible}
        onClose={closeDrawer}
        onSelected={onSelectIcon}
      />
    </>
  );
}
// Used to escape the following react warning:
// index.js:1 Warning: Function components cannot be given refs. Attempts to access this ref will fail. Did you mean to use React.forwardRef()?
// 原因很可能是：antd Form 中 getFieldDecorator 的实现使用了 ref
class IconSelectClassComponent extends React.Component {
  public render() {
    // @ts-ignore
    return <IconSelect {...this.props} />;
  }
}

const AppList = ({ dir, apps, onDeleteApp, onChangeDescription }) => {
  const columnClassName = "text-base";
  const columns = [
    {
      title: "类型",
      dataIndex: "type",
      key: "type",
      className: columnClassName,
      render: (text, record, index) => {
        if (record.type === EntryType.App) {
          return <Icon type="file-text" className="text-gray-500 text-3xl" />;
        } else {
          return (
            <Icon
              type="folder"
              theme="filled"
              className="text-blue-400 text-3xl"
            />
          );
        }
      }
    },
    {
      title: "名称",
      dataIndex: "name",
      key: "name",
      className: columnClassName,
      render: (text, record, index) => {
        return record.type === EntryType.Directory ? (
          <Link to={`/manage${dir}${encodeURIComponent(record.name)}`}>
            {record.icon ? <Icon type={record.icon} className="pr-2" /> : null}
            {record.name}
          </Link>
        ) : (
          <Link to={`/edit${dir}${encodeURIComponent(record.name)}`}>
            {record.icon ? <Icon type={record.icon} className="pr-2" /> : null}
            {record.name}
          </Link>
        );
      }
    },
    /*
    {
      title: "备注",
      dataIndex: "comment",
      key: "comment",
      className: columnClassName,
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
    */
    {
      title: "操作",
      key: "operation",
      className: columnClassName,
      render: (text, record, index) => (
        <AppOperation
          text={text}
          record={record}
          index={index}
          onDeleteApp={onDeleteApp}
          dir={dir}
        />
      )
    }
  ];

  return (
    <Table
      columns={columns}
      dataSource={apps}
      pagination={{
        simple: true,
        hideOnSinglePage: true,
        pageSize: 5
      }}
      size="default"
      rowKey={record => record.name}
    />
  );
};

const NewEntryForm = Form.create()(
  // WARNING: Form 不能是函数组件，会报错，暂不清楚原因，与实现细节有关
  class extends React.Component {
    public render() {
      // @ts-ignore
      const { visible, onCancel, onCreate, form, allowNewSubMenu } = this.props;
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
                initialValue: EntryType.App
              })(
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value={EntryType.App}>应用</Radio.Button>
                  {allowNewSubMenu ? (
                    <Radio.Button value={EntryType.Directory}>
                      子菜单
                    </Radio.Button>
                  ) : null}
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

async function addEntry(setMutating, dir, entry) {
  setMutating(true);
  try {
    const result = await lubanApiRequest(SWRKey.CURRENT_USER_ENTRY, {
      method: "POST",
      body: makeJsonBody({
        dir,
        entry
      })
    });
    if (result.code === 0) {
      trigger(SWRKey.CURRENT_USER);
    } else {
      message.error(`创建失败(错误码: ${result.code}): ${result.msg}`);
    }
  } catch (e) {
    message.error(`创建异常(${e.name}): ${e.message}`);
  }
  setMutating(false);
}

async function deleteEntry(setMutating, dir, entryName) {
  setMutating(true);
  try {
    const result = await lubanApiRequest(SWRKey.CURRENT_USER_ENTRY, {
      method: "DELETE",
      body: makeJsonBody({
        dir,
        entryName
      })
    });
    if (result.code === 0) {
      trigger(SWRKey.CURRENT_USER);
    } else if (result.code === ServerErrCode.DirNotEmpty) {
      message.error(`请先清空文件夹`);
    } else {
      message.error(`删除失败(错误码: ${result.code}): ${result.msg}`);
    }
  } catch (e) {
    message.error(`删除异常(${e.name}): ${e.message}`);
  }
  setMutating(false);
}

const Page = ({ match }) => {
  const { data: currentUser } = useContext(CurrentUserContext);
  const [mutating, setMutating] = useState(false);
  const [visible, setVisible] = useState(false);
  const formRef = useRef(null);

  const { firstLevelDir, secondLevelDir } = match.params;
  const dirCtx = [firstLevelDir, secondLevelDir].filter(i => i); // remove undefined
  let currentDir = "/",
    linkDir = "/";
  for (const dir of dirCtx) {
    currentDir += dir + "/";
    linkDir += encodeURIComponent(dir) + "/";
  }

  const { rootDir } = currentUser;
  const entryList = findDir(currentDir, rootDir);
  if (!entryList) {
    // dir not found
    message.error(`未找到目录: ${currentDir}`);
    return <Redirect to="/manage" />;
  }
  // used to detect whether to-add entry already exist
  let entryNameMap = {};
  /**
   * 如果直接使用 entryList 的话，因为 entry.children 为 Entry[] 类型
   * 发现在这种情况下, antd 的 Table 会默认显示「该行可展开」
   */
  let noChildrenEntryList: EntryBase[] = [];
  for (const entry of entryList) {
    entryNameMap[entry.name] = entry;
    noChildrenEntryList.push({
      name: entry.name,
      type: entry.type
    });
  }

  const myAddEntry = addEntry.bind(null, setMutating, currentDir);
  const myDeleteEntry = deleteEntry.bind(null, setMutating, currentDir);

  const showModal = () => {
    setVisible(true);
  };
  const handleCancel = () => {
    setVisible(false);
  };

  const saveFormRef = form => {
    formRef.current = form;
  };

  const handleCreate = () => {
    const { form } = formRef.current.props;
    form.validateFields((err, values) => {
      if (err) {
        return;
      }

      if (values.name in entryNameMap) {
        form.setFields({
          name: {
            value: values.name,
            errors: [new Error(`应用「${values.name}」已存在`)]
          }
        });
        return;
      }

      myAddEntry(values);
      form.resetFields();
      setVisible(false);
    });
  };

  return (
    <UserPortalLayout sider={<Sider />}>
      <div className="m-16">
        <div className="my-4">
          <Breadcrumb>
            <Breadcrumb.Item>
              <Link to="/manage/">
                <Icon type="home" style={{ fontSize: "1.5rem" }} />
              </Link>
            </Breadcrumb.Item>
            {firstLevelDir ? (
              <Breadcrumb.Item>
                <Link to={"/manage/" + encodeURIComponent(firstLevelDir)}>
                  {/* [PASS] 中文可以么 ? */}
                  <span className="text-lg">{firstLevelDir}</span>
                </Link>
              </Breadcrumb.Item>
            ) : null}
            {secondLevelDir ? (
              <Breadcrumb.Item>
                <Link
                  to={
                    "/manage/" +
                    encodeURIComponent(firstLevelDir) +
                    "/" +
                    encodeURIComponent(secondLevelDir)
                  }
                >
                  <span className="text-lg">{secondLevelDir}</span>
                </Link>
              </Breadcrumb.Item>
            ) : null}
          </Breadcrumb>
        </div>
        <Spin spinning={mutating}>
          <AppList
            dir={linkDir}
            apps={noChildrenEntryList}
            onDeleteApp={myDeleteEntry}
          />
        </Spin>
        <div className="mt-4 flex justify-end">
          <Button type="primary" size="large" onClick={showModal}>
            新建
          </Button>
          <NewEntryForm
            wrappedComponentRef={saveFormRef}
            visible={visible}
            onCancel={handleCancel}
            onCreate={handleCreate}
            // max directory depth = 3
            allowNewSubMenu={dirCtx.length < 2}
          />
        </div>
      </div>
    </UserPortalLayout>
  );
};

export default withCurrentUserContext(Page);
