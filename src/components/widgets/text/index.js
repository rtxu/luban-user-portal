import Widget from './Widget';
import ConfigPanel from './ConfigPanel';
import reducer, { initialState, getExportedState, getExportedStateNoTemplate } from './reducer';

// View: <Widget> and <Widget.ConfigPanel>
Widget.ConfigPanel = ConfigPanel;

// state transformer: reducer
Widget.initialState = initialState;
Widget.reducer = reducer;

// determine which properties other component could reference
Widget.getExportedState = getExportedState;
// determine which properties other component could reference when evaluating template
Widget.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default Widget;