import Text from './Text';
import ConfigPanel from './ConfigPanel';
import reducer, { getExportedState, getExportedStateNoTemplate } from './reducer';

// View: <Text> and <Text.ConfigPanel>
Text.ConfigPanel = ConfigPanel;

// state transformer: reducer
Text.reducer = reducer;

// determine which properties other component could reference
Text.getExportedState = getExportedState;
Text.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default Text;