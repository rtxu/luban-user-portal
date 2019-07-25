import { useReducer } from 'react';
import PropTypes from 'prop-types';
import styles from './__Widget__.less';
import { 
  Collapse,
} from "antd";
import Config from './Config';

function __Widget__({ }) {
  const classNames = [styles.widget__Widget__]
  return (
    <div className={classNames.join(' ')}>
    </div>
  );
}

__Widget__.propTypes = {
};

__Widget__.defaultProps = {
};

const initialState = __Widget__.defaultProps;
const ACTION_TYPE = {
}
function reducer(prevState, action) {
  switch (action.type) {

    default:
      throw new Error(`in __Widget__Widget reducer(): unexpected action type: ${action.type}`);
  }
}

function ConfigPanel({dispatch}) {

  const { Panel } = Collapse;

  return (
    <Collapse
      defaultActiveKey={['1', '2']}
      expandIconPosition='right'
    >
      <Panel header='内容' key='1' >
      </Panel>
      <Panel header='显示选项' key='2' >
      </Panel>
    </Collapse>
  );
}

ConfigPanel.propTypes = {
  ...__Widget__.PropTypes,
  dispatch: PropTypes.func.isRequired,
}
__Widget__.ConfigPanel = ConfigPanel;
__Widget__.initialState = initialState;
__Widget__.reducer = reducer;

__Widget__.use = () => {
  const [widgetProps, widgetDispatch] = useReducer(__Widget__.reducer, __Widget__.initialState);
  return ([<__Widget__ {...widgetProps} />, 
    widgetProps, 
  <__Widget__.ConfigPanel dispatch={widgetDispatch} {...widgetProps} />]);
}

export default __Widget__;
