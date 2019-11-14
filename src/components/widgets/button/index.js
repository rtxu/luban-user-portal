import ConfigPanel from "./ConfigPanel";
import reducer, {
  getExportedState,
  getRawExportedState,
  getToEvalTemplates,
  initialState
} from "./reducer";
import Widget from "./Widget";

// View: <Widget> and <Widget.ConfigPanel>
Widget.ConfigPanel = ConfigPanel;

// state transformer: reducer
Widget.initialState = initialState;
Widget.reducer = reducer;

// determine which properties other component could reference
Widget.getExportedState = getExportedState;
// determine which properties other component could reference when evaluating template
Widget.getRawExportedState = getRawExportedState;

Widget.getToEvalTemplates = getToEvalTemplates;

export default Widget;
