import produce from 'immer';
import { createAction, handleActions } from 'redux-actions';

import { createDefaultToEvalTemplate } from '../common';

// Actions
export const setIsScrollWhenOverflow = createAction('IS_SCROLL_WHEN_OVERFLOW_SET');
export const setIsExpandWhenHover = createAction('IS_EXPAND_WHEN_HOVER_SET');
export const setValueTemplateInput = createAction('VALUE_TEMPLATE_INPUT_SET');
export const evalValueTemplate = createAction('VALUE_TEMPLATE_EVAL');

export const initialState = {
  isScrollWhenOverflow: false,
  isExpandWhenHover: false,
  valueTemplate: {
    input: '这里填被展示的文本 😃',
    value: null,
    error: null,
  },
};

// Reducers
export default handleActions({
  [setIsScrollWhenOverflow]: (state, action) => {
    return {
      ...state,
      isScrollWhenOverflow: action.payload,
    }
  },
  [setIsExpandWhenHover]: (state, action) => {
    return {
      ...state,
      isExpandWhenHover: action.payload,
    }
  },
  [setValueTemplateInput]: (state, action) => {
    return produce(state, draft => {
      draft.valueTemplate.input = action.payload;
    })
  },
  [evalValueTemplate]: (state, action) => {
    return produce(state, draft => {
      const { value, error } = action.payload;
      draft.valueTemplate.value = value;
      draft.valueTemplate.error = error ? `${error.name}: ${error.message}`: null;
    })
  },
}, initialState);

// Selectors
// 用于构造计算模板结果时使用的 context，不包含模板项
export const getRawExportedState = (state) => (
  {
  }
)

// ModelBrowser 使用，组件公开的所有数据
export const getExportedState = (state) => (
  {
    ...getRawExportedState(state),
    value: state.valueTemplate.value,
  }
)

export const getToEvalTemplates = (state) => {
  return [
    createDefaultToEvalTemplate(
      'value',
      state.valueTemplate.input, 
      evalValueTemplate.toString()
    ),
  ];
};