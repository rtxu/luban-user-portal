import { Result, Button } from "antd";
import Link from "umi/link";
import React from "react";

export default () => {
  /* Empty App */
  return (
    <Result
      status="404"
      title="暂无应用"
      extra={
        <Link to="/manage">
          <Button type="primary">创建</Button>
        </Link>
      }
    />
  );
};
