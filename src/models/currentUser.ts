import { Action, createAction, handleActions } from "redux-actions";

// Actions
const NS = "currentUser";
const loginSuccessType = "USER_LOGIN_SUCCESS_TYPE";
const loginSuccessTypeNs = `${NS}/${loginSuccessType}`;
export const loginSuccess = createAction(loginSuccessTypeNs);

// initial state
export const initialState = {
  username: "guest"
};

// Reducers
export default {
  state: initialState,
  effects: {},
  reducers: {
    [loginSuccessType]: (state, action) => {
      return action.payload;
    }
  }
};

// Selectors
