import { createMockHandler, makeQueryString } from "@/util";
import request from "../util/request";
import jwt from "jsonwebtoken";
import moment from "moment";

function loginSuccess(req, res) {
  // success
  const token = {
    action: req.params.action,
    github_code: req.query.code,
    current_time: moment().format()
  };
  res.redirect(
    303,
    `/login-success?${makeQueryString({
      access_token: `Bearer mocked_jwt_token_${JSON.stringify(token)}`
    })}`
  );
}

function loginFail(req, res) {
  // fail
  setTimeout(() => {
    res.redirect(
      303,
      `/login?${makeQueryString({
        loginError: `该 GitHub 账户已存在`
      })}`
    );
  }, 1000);
}

// req 和 res 的文档：https://expressjs.com/en/4x/api.html#req
export default {
  "GET /callback/github/:action": createMockHandler(async (req, res) => {
    //loginSuccess(req, res);
    loginFail(req, res);
  })
};
