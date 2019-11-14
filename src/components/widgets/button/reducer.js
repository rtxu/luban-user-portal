import { createAction, handleActions } from "redux-actions";

import { defaultAction } from "./common";

//- Actions
export const setText = createAction("TEXT_SET");
export const setColor = createAction("COLOR_SET");
export const setActionType = createAction("ACTION_TYPE_SET");
export const OpenAnyWebPage = {
  setHref: createAction("HREF_SET_WHEN_OPNE_ANY_WEB_PAGE"),
  setIsOpenInNewTab: createAction(
    "IS_OPEN_IN_NEW_TAB_SET_WHEN_OPNE_ANY_WEB_PAGE"
  )
};
export const TriggerAnAction = {
  setOp: createAction("OP_SET_WHEN_TRIGGER_AN_ACTION")
};

export const initialState = {
  text: "提交",
  color: "#1EA9FB",
  actionType: defaultAction,
  actionTriggerAnAction: {
    opId: null
  },
  actionOpenAnyWebPage: {
    href: null,
    isOpenInNewTab: false
  }
};

//- Reducers
export default handleActions(
  {
    [setText]: (state, action) => {
      return {
        ...state,
        text: action.payload
      };
    },
    [setColor]: (state, action) => {
      return {
        ...state,
        color: action.payload
      };
    },
    [setActionType]: (state, action) => {
      return {
        ...state,
        actionType: action.payload
      };
    },
    [OpenAnyWebPage.setHref]: (state, action) => {
      return {
        ...state,
        actionOpenAnyWebPage: {
          ...state.actionOpenAnyWebPage,
          href: action.payload
        }
      };
    },
    [OpenAnyWebPage.setIsOpenInNewTab]: (state, action) => {
      return {
        ...state,
        actionOpenAnyWebPage: {
          ...state.actionOpenAnyWebPage,
          isOpenInNewTab: action.payload
        }
      };
    },
    [TriggerAnAction.setOp]: (state, action) => {
      return {
        ...state,
        actionTriggerAnAction: {
          ...state.actionTriggerAnAction,
          opId: action.payload
        }
      };
    }
  },
  initialState
);

//- Selectors
// 用于构造计算模板结果时使用的 context，不包含模板项
export const getRawExportedState = state => ({
  text: state.text
});

// ModelBrowser 使用，组件公开的所有数据
export const getExportedState = state => ({
  ...getRawExportedState(state)
});

export const getToEvalTemplates = state => {
  return [];
};
