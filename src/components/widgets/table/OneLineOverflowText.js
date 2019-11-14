import React, { useReducer, useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import styles from "./OneLineOverflowText.less";
import { Collapse, Tooltip, Button } from "antd";
import Config from "../Config";

function OneLineOverflowText({ text }) {
  const [isOverflow, setIsOverflow] = useState(false);
  const textDivRef = useRef(null);

  useEffect(() => {
    const textDiv = textDivRef.current;
    if (textDiv.offsetWidth < textDiv.scrollWidth) {
      setIsOverflow(true);
    } else {
      setIsOverflow(false);
    }
  }, [text]);

  return (
    <div className={styles.widgetOneLineOverflowText}>
      <div
        ref={textDivRef}
        className={isOverflow ? styles.overflown : styles.mightOverflow}
      >
        {text}
      </div>
      {isOverflow && (
        <Tooltip title={text} placement="right">
          <Button size="small" ghost type="link" icon="small-dash" />
        </Tooltip>
      )}
    </div>
  );
}

OneLineOverflowText.propTypes = {
  text: PropTypes.string
};

OneLineOverflowText.defaultProps = {
  text:
    "这里有一个超级长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长长的文本，用以测量是否会 overflow"
};

const initialState = OneLineOverflowText.defaultProps;
const ACTION_TYPE = {
  setText: Symbol()
};
function reducer(prevState, action) {
  switch (action.type) {
    case ACTION_TYPE.setText:
      return {
        ...prevState,
        text: action.payload
      };

    default:
      throw new Error(
        `in OneLineOverflowTextWidget reducer(): unexpected action type: ${action.type}`
      );
  }
}

function ConfigPanel({ text, dispatch }) {
  function setText(event) {
    dispatch({
      type: ACTION_TYPE.setText,
      payload: event.target.value
    });
  }

  const { Panel } = Collapse;

  return (
    <Collapse defaultActiveKey={["1"]} expandIconPosition="right">
      <Panel header="内容" key="1">
        <Config.LabelInput
          label={{ value: "文本" }}
          input={{
            value: text,
            onChange: setText
          }}
        />
      </Panel>
    </Collapse>
  );
}

ConfigPanel.propTypes = {
  ...OneLineOverflowText.PropTypes,
  dispatch: PropTypes.func.isRequired
};
OneLineOverflowText.ConfigPanel = ConfigPanel;
OneLineOverflowText.initialState = initialState;
OneLineOverflowText.reducer = reducer;

OneLineOverflowText.use = () => {
  const [widgetProps, widgetDispatch] = useReducer(
    OneLineOverflowText.reducer,
    OneLineOverflowText.initialState
  );
  return [
    <OneLineOverflowText {...widgetProps} />,
    widgetProps,
    <OneLineOverflowText.ConfigPanel
      dispatch={widgetDispatch}
      {...widgetProps}
    />
  ];
};

export default OneLineOverflowText;
