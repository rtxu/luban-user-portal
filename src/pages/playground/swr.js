import React, { useState } from "react";
import { Table, Spin, Button, message } from "antd";
import useSWR, { trigger, mutate } from "swr";

import moment from "moment";

function log(...args) {
  console.log(`[${moment().format()}]`, ...args);
}

let index = 0;
let entries = [];

function newEntry() {
  index++;
  return { name: "name" + index, comment: "comment" + index, key: `${index}` };
}

function fetch(key, delay) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      log("delay fetch", entries);
      resolve(entries);
    }, 3000);
  });
}

function addEntry(entry, delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      log("addEntry");
      entries = [...entries, entry];
      resolve({ code: 0 });
    }, delay);
  });
}

function removeEntry(delay) {
  return new Promise(resolve => {
    setTimeout(() => {
      log("removeEntry");
      entries = entries.slice(1);
      resolve({ code: 0 });
    }, delay);
  });
}

// 试验一下不同 swr 行为情况下的客户端体验
function Page() {
  const KEY = "key";
  const { data, isValidating } = useSWR(KEY, fetch, {
    revalidateOnFocus: false,
    dedupingInterval: 0
  });
  const [mutating, setMutating] = useState(false);
  const onAdd = async () => {
    setMutating(true);
    const { code } = await addEntry(newEntry(), 3000);
    setMutating(false);
    if (code === 0) {
      log("trigger after add");
      trigger(KEY);
    } else {
      message.error("新建失败");
    }
  };
  const onRemove = async () => {
    const { code } = await removeEntry();
    if (code === 0) {
      log("trigger after remove");
      trigger(KEY);
    }
  };

  const columns = [
    {
      title: "名称",
      dataIndex: "name",
      key: "name"
      // render: (text, record, index) => { }
    },
    {
      title: "备注",
      dataIndex: "comment",
      key: "comment"
      // render: (text, record, index) => ()
    }
  ];

  return (
    <>
      <Button type="primary" onClick={onAdd}>
        新建
      </Button>
      <Button type="danger" onClick={onRemove}>
        删除
      </Button>
      <Button disabled>{isValidating ? "Validating" : "None"}</Button>
      <Spin spinning={mutating || isValidating}>
        <Table
          columns={columns}
          dataSource={data}
          pagination={{
            simple: true,
            hideOnSinglePage: true,
            pageSize: 100
          }}
          size="default"
        />
      </Spin>
    </>
  );
}

export default Page;
