import { createAction } from 'redux-actions';

// Actions
const NS = 'editorCtx';
const initEditorCtxType = `EDITOR_CTX_INIT`;
const initEditorCtxTypeNs = `${NS}/EDITOR_CTX_INIT`;
export const initEditorCtx = createAction<{activeOpId?: string | null, activeWidgetId?: string | null}>(initEditorCtxTypeNs);
const setActiveOpIdType = `ACTIVE_OP_ID_SET`;
const setActiveOpIdTypeNs = `${NS}/ACTIVE_OP_ID_SET`;
export const setActiveOpId = createAction<string>(setActiveOpIdTypeNs);
const setActiveWidgetIdType = `ACTIVE_WIDGET_ID_SET`;
const setActiveWidgetIdTypeNs = `${NS}/ACTIVE_WIDGET_ID_SET`;
export const setActiveWidgetId = createAction<string>(setActiveWidgetIdTypeNs);

// initial state
export const initialState = {
  activeOpId: null,
  activeWidgetId: null,
}

// Reducers
export default {
  state: initialState,
  effects: {},
  reducers: {
    [initEditorCtxType]: (state, action) => {
      return action.payload;
    },
    [setActiveOpIdType]: (state, action) => {
      return {
        ...state,
        activeOpId: action.payload,
      }
    },
    [setActiveWidgetIdType]: (state, action) => {
      return {
        ...state,
        activeWidgetId: action.payload,
      }
    },
  },
};

// Selectors