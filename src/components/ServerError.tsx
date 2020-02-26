import React from "react";
import { Result, Button } from "antd";

export interface ServerErrorProps {
  error: any;
}
const ServerError: React.FC<ServerErrorProps> = ({ error }) => {
  const NextAction = null;
  /*
    <Button type="primary" href="http://nandgame.com/">
      玩会游戏，休息一下
    </Button>
  */
  return (
    <Result
      status="500"
      title="Oooooops，服务器开小差了"
      subTitle="稍安勿躁，工程师正在努力抢修"
      extra={NextAction}
    />
  );
};

export default ServerError;
