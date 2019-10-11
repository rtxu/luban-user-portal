import { createAction } from 'redux-actions';

//- Actions
export const setActiveOpId = createAction('ACTIVE_OP_ID_SET');
export const setActiveWidgetId = createAction('ACTIVE_WIDGET_ID_SET');

//- initial state
const initialState = {
  activeOpId: null,
  activeWidgetId: null,
}

//- Reducers
export default {
  state: initialState,
  effects: {},
  reducers: {
    [setActiveOpId]: (state, action) => {
      return {
        ...state,
        activeOpId: action.payload,
      }
    },
    [setActiveWidgetId]: (state, action) => {
      return {
        ...state,
        activeWidgetId: action.payload,
      }
    },
  },
};

//- Selectors