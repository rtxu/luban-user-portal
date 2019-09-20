import lodash from 'lodash';
import { Text, TextInput, Button, Table } from './widgets';

// NOTICE: `Type` must be a unique description string, when drop it will be used to generate widgetId(= type + instanceId)
export const Type = {
  TEXT: 'text',
  BUTTON: 'button',
  TABLE: 'table',
  TEXTINPUT: 'text_input',

  ONE_LINE_OVERFLOW_TEXT: 'one_line_overflow_text',
}

function createState(type) {
  switch (type) {
    case Type.TEXT:
      return lodash.cloneDeep(Text.defaultProps);
    case Type.BUTTON:
      return lodash.cloneDeep(Button.defaultProps);
    case Type.TABLE:
      return lodash.cloneDeep(Table.defaultProps);
    case Type.TEXTINPUT:
      return lodash.cloneDeep(TextInput.defaultProps);
    default:
      throw new Error(`in createState: unexpected widget type: ${type}`);
  }
}

function createElement(type, props) {
  switch (type) {
    case Type.TEXT:
      return <Text {...props} />
    case Type.BUTTON:
      return <Button {...props} />
    case Type.TABLE:
      return <Table {...props} />
    case Type.TEXTINPUT:
      return <TextInput {...props} />
    default:
      throw new Error(`in createElement: unexpected widget type: ${type}`);
  }
}

function createConfigPanelElement(type, props) {
  switch (type) {
    case Type.TEXT:
      return <Text.ConfigPanel {...props} />
    case Type.BUTTON:
      return <Button.ConfigPanel {...props} />
    case Type.TABLE:
      return <Table.ConfigPanel {...props} />
    case Type.TEXTINPUT:
      return <TextInput.ConfigPanel {...props} />
    default:
      throw new Error(`in createConfigPanelElement: unexpected widget type: ${type}`);
  }
}

function getReducer(type) {
  switch (type) {
    case Type.TEXT:
      return Text.reducer;
    case Type.BUTTON:
      return Button.reducer;
    case Type.TABLE:
      return Table.reducer;
    case Type.TEXTINPUT:
      return TextInput.reducer;
    default:
      throw new Error(`in getReducer: unexpected widget type: ${type}`);
  }
}

function getExportedState(type) {
  switch (type) {
    case Type.TEXT:
      return Text.getExportedState;
    case Type.BUTTON:
      return Button.exporter;
    case Type.TABLE:
      return Table.exporter;
    case Type.TEXTINPUT:
      return TextInput.exporter;
    default:
      throw new Error(`in getExporter: unexpected widget type: ${type}`);
  }
}

function getExportedStateNoTemplate(type) {
  switch (type) {
    case Type.TEXT:
      return Text.getExportedStateNoTemplate;
    case Type.BUTTON:
      return Button.exporter;
    case Type.TABLE:
      return Table.exporter;
    case Type.TEXTINPUT:
      return TextInput.exporter;
    default:
      throw new Error(`in getExporter: unexpected widget type: ${type}`);
  }
}


const WidgetFactory = {};
WidgetFactory.Type = Type;
WidgetFactory.createState = createState;
WidgetFactory.createElement = createElement;
WidgetFactory.createConfigPanelElement = createConfigPanelElement;
WidgetFactory.getReducer = getReducer;
WidgetFactory.getExportedState = getExportedState;
WidgetFactory.getExportedStateNoTemplate = getExportedStateNoTemplate;

export default WidgetFactory;