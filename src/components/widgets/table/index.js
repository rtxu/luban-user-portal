import Table from './Table';
import ConfigPanel from './ConfigPanel';
import reducer, { initialState, getExportedState, getExportedStateNoTemplate } from './reducer';

// View: <Table> and <Table.ConfigPanel>
Table.ConfigPanel = ConfigPanel;

// state transformer: reducer
Table.initialState = initialState;
Table.reducer = reducer;

// determine which properties other component could reference
Table.getExportedState = getExportedState;

// determine which properties other component could reference when evaluating template
Table.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default Table;