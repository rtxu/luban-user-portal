import { createLogger } from '@/util';

const logger = createLogger('/pages/editor/models/operations');

const initialState = {
  opMap: { },
  activeOpId: null,
};
const defaultOpType = 'SQL_readonly';

export const NS = 'operations';

export default {
  state: initialState,
  effects: {
  },
  reducers: {
    add(state, action) {
      logger.debug(action.type, action.payload);
      let instanceId = Object.keys(state.opMap).length + 1;
      while (`op${instanceId}` in state.opMap) {
        instanceId += 1;
      }
      const newOp = {
        id: `op${instanceId}`,
        type: defaultOpType,
      }
      return {
        opMap: {
          ...state.opMap,
          [newOp.id]: newOp,
        },
        activeOpId: newOp.id,
      }
    },
    setActive(state, action) {
      logger.debug(action.type, action.payload);
      return {
        opMap: state.opMap,
        activeOpId: action.payload,
      }
    },
    delete(state, action) {
      logger.debug(action.type, action.payload);
      const toDeleteOpKey = action.payload;
      const newOpKeys = Object.keys(state.opMap).filter((opKey) => opKey !== toDeleteOpKey)
      const newOpMap = newOpKeys.reduce((newOpMap, opKey) => {
        newOpMap[opKey] = state.opMap[opKey];
        return newOpMap;
      }, {});
      return {
        opMap: newOpMap,
        activeOpId: null,
      }
    },
    setTemplate(state, action) {
      logger.debug(action);
      const { id, template } = action.payload;
      const activeOp = {
        ...state.opMap[id],
        template,
      }
      return {
        ...state,
        opMap: {
          ...state.opMap,
          [activeOp.id]: activeOp, 
        },
        activeOpId: activeOp.id,
      }
    },
    setData(state, action) {
      logger.debug('setData', action);
      const { id, data }  = action.payload;
      const activeOp = {
        ...state.opMap[id],
        data,
      }
      return {
        ...state,
        opMap: {
          ...state.opMap,
          [activeOp.id]: activeOp,
        },
        activeOpId: activeOp.id,
      }
    },
  },
};