import Button from './Button';
import ConfigPanel from './ConfigPanel';
import reducer, { initialState, getExportedState, getExportedStateNoTemplate } from './reducer';

// View: <Button> and <Button.ConfigPanel>
Button.ConfigPanel = ConfigPanel;

// state transformer: reducer
Button.initialState = initialState;
Button.reducer = reducer;

// determine which properties other component could reference
Button.getExportedState = getExportedState;
// determine which properties other component could reference when evaluating template
Button.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default Button;