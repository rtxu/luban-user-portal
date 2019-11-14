import PropTypes from "prop-types";

import Config from "../Config";
import { OpenAnyWebPage } from "./reducer";

function OpenAnyWebPageConfigPanel({ isOpenInNewTab, href, dispatch }) {
  return (
    <>
      <Config.LabelInput
        label={{ value: "URL" }}
        input={{
          placeholder: "https://example.com?param1=value1",
          value: href,
          onChange: e => {
            dispatch(OpenAnyWebPage.setHref(e.target.value));
          }
        }}
      />
      <Config.Switch
        checked={isOpenInNewTab}
        onChange={checked => {
          dispatch(OpenAnyWebPage.setIsOpenInNewTab(checked));
        }}
        description="是否在新标签页打开"
      />
    </>
  );
}

OpenAnyWebPageConfigPanel.propTypes = {
  isOpenInNewTab: PropTypes.bool,
  href: PropTypes.string
};

export default OpenAnyWebPageConfigPanel;
