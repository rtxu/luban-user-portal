import Text from './Text';
import ConfigPanel from './ConfigPanel';
import reducer, { initialState, getExportedState, getExportedStateNoTemplate } from './reducer';

// View: <Text> and <Text.ConfigPanel>
Text.ConfigPanel = ConfigPanel;

// state transformer: reducer
Text.initialState = initialState;
Text.reducer = reducer;

// determine which properties other component could reference
Text.getExportedState = getExportedState;
// determine which properties other component could reference when evaluating template
Text.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default Text;