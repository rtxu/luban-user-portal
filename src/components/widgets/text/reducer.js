import { createAction, handleActions } from 'redux-actions';
import produce from 'immer';

//- Actions
export const setIsScrollWhenOverflow = createAction('IS_SCROLL_WHEN_OVERFLOW_SET');
export const setIsExpandWhenHover = createAction('IS_EXPAND_WHEN_HOVER_SET');
export const setTemplateOfValue = createAction('TEMPLATE_OF_VALUE_SET');

export const initialState = {
  isScrollWhenOverflow: false,
  isExpandWhenHover: false,
  templateMap: {
    value: {
      template: '这里填被展示的文本 😃',
    }
  },
};

//- Reducers
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
  [setTemplateOfValue]: (state, action) => {
    return produce(state, draft => {
      draft.templateMap.value.template = action.payload;
    })
  },
}, initialState);

//- Selectors
// 用于构造计算模板结果时使用的 context，不包含模板项
export const getExportedStateNoTemplate = (state) => (
  {
  }
)

// ModelBrowser 使用，组件公开的所有数据
export const getExportedState = (state) => (
  {
    ...getExportedStateNoTemplate(state),
    value: state.templateMap.value.value,
  }
)