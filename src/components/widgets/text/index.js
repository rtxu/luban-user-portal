import Text from './Text';
import ConfigPanel from './ConfigPanel';
import reducer from './reducer';
import exporter from './exporter';

// View: <Text> and <Text.ConfigPanel>
Text.ConfigPanel = ConfigPanel;

// state transformer: reducer
Text.reducer = reducer;

// determine which properties other component could reference
Text.exporter = exporter;

export default Text;