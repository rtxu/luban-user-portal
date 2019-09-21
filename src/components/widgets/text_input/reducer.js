import { createAction, handleActions } from 'redux-actions';

//- Actions
export const setLabel = createAction('LABEL_SET');
export const setLabelMaxWidth = createAction('LABEL_MAX_WIDTH_SET');
export const setInputValue = createAction('INPUT_VALUE_SET');
export const setInputPlaceholder = createAction('INPUT_PLACEHOLDER_SET');
export const setInputType = createAction('INPUT_TYPE_SET');

export const initialState = {
  label: '搜索',
  labelMaxWidth: 150,
  input: {
    type: 'text',
    value: '',
    placeholder: '请输入关键词...',
  }
};

//- Reducers
export default handleActions({
  [setLabel]: (state, action) => {
    return {
      ...state,
      label: action.payload,
    }
  },
  [setLabelMaxWidth]: (state, action) => {
    return {
      ...state,
      labelMaxWidth: action.payload,
    }
  },
  [setInputValue]: (state, action) => {
    return {
      ...state,
      input: {
        ...state.input,
        value: action.payload,
      }
    }
  },
  [setInputPlaceholder]: (state, action) => {
    return {
      ...state,
      input: {
        ...state.input,
        placeholder: action.payload,
      }
    }
  },
  [setInputType]: (state, action) => {
    return {
      ...state,
      input: {
        ...state.input,
        type: action.payload,
      }
    }
  }
}, initialState);

//- Selectors
// 用于构造计算模板结果时使用的 context，不包含模板项
export const getExportedStateNoTemplate = (state) => (
  {
    value: state.input.value,
    label: state.label,
  }
);

// ModelBrowser 使用，组件公开的所有数据
export const getExportedState = (state) => (
  {
    ...getExportedStateNoTemplate(state),
  }
)