
export const BUTTON_ACTION_OPTION_MAP = Object.freeze({
  TriggerAnAction: '触发 Action',    // doing
  OpenAnyWebPage: '打开任意网页',     // done
  // BETTER(feature) TODO(ruitao.xu): low priority
  // OpenAnotherLocalPage: '打开本站其他页面',
})

export const actionOptions = Object.freeze(Object.values(BUTTON_ACTION_OPTION_MAP));
export const defaultAction = BUTTON_ACTION_OPTION_MAP.TriggerAnAction;
