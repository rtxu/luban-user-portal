import Config from '../Config';

function TriggerAnActionConfigPanel({}) {
  // TODO(ruitao.xu): load already exist action
  const options = ['新建 Action'];

  // TODO(ruitao.xu): load action and redirect focus to ActionEditor
  function onChange(value) {
    console.log('in TriggerAnActionConfigPanel(), selected: ', value);
  }

  return (
    <Config.LabelSelect
      select={{
        placeholder: '选择 Action',
        options: options,
        onChange: onChange,
      }}
    />
  );
}

TriggerAnActionConfigPanel.propTypes = {
}

export default TriggerAnActionConfigPanel;