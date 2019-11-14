import PropTypes from "prop-types";

import Config from "../Config";

function OpenAnotherLocalPageConfigPanel({ isOpenInNewTab }) {
  // BETTER TODO(ruitao.xu): load already exist page
  const options = ["placeholder #1", "placeholder #2"];

  // BETTER TODO(ruitao.xu):
  function onChange(value) {
    console.log(
      "in OpenAnotherLocalPageConfigPanel::onChange, selected: ",
      value
    );
  }
  function onIsOpenInNewTabChange(checked) {
    console.log(
      "in OpenAnotherLocalPageConfigPanel::onIsOpenInNewTabChange, checked: ",
      checked
    );
  }

  return (
    <>
      <Config.LabelSelect
        label={{ value: "本站页面" }}
        select={{
          options: options,
          onChange: onChange
        }}
      />
      <Config.Switch
        checked={isOpenInNewTab}
        onChange={onIsOpenInNewTabChange}
        description="是否在新标签页打开"
      />
    </>
  );
}

OpenAnotherLocalPageConfigPanel.propTypes = {
  isOpenInNewTab: PropTypes.bool
};
OpenAnotherLocalPageConfigPanel.defaultProps = {
  isOpenInNewTab: false
};

export default OpenAnotherLocalPageConfigPanel;
