import { Result, Button } from "antd";
import Link from "umi/link";
import React from "react";

export default () => {
  return (
    <Result
      status="404"
      title="应用不存在"
      extra={
        <Link to="/">
          <Button type="primary">返回</Button>
        </Link>
      }
    />
  );
};
