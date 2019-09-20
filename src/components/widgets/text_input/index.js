import TextInput from './TextInput';
import ConfigPanel from './ConfigPanel';
import reducer, { initialState, getExportedState, getExportedStateNoTemplate } from './reducer';

// View: <TextInput> and <TextInput.ConfigPanel>
TextInput.ConfigPanel = ConfigPanel;

// state transformer: reducer
TextInput.initialState = initialState;
TextInput.reducer = reducer;

// determine which properties other component could reference
TextInput.getExportedState = getExportedState;
// determine which properties other component could reference when evaluating template
TextInput.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default TextInput;