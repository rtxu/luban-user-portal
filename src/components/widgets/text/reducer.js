import { createAction, handleActions } from 'redux-actions';
import Text from './Text';

//- Actions
export const setIsScrollWhenOverflow = createAction('IS_SCROLL_WHEN_OVERFLOW_SET');
export const setIsExpandWhenHover = createAction('IS_EXPAND_WHEN_HOVER_SET');
export const setValue = createAction('VALUE_SET');

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
  [setValue]: (state, action) => {
    return {
      ...state,
      value: action.payload,
    }
  },
}, Text.defaultProps);

//- Selectors
export const getExported = (state) => (
  {
    value: state.value,
  }
)