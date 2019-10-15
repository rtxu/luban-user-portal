import lodash from 'lodash';
import { Text, TextInput, Button, Table } from './widgets';

// NOTICE: `Type` must be a unique description string, when drop it will be used to generate widgetId(= type + instanceId)
export const Type = Object.freeze({
  TEXT: 'text',
  BUTTON: 'button',
  TABLE: 'table',
  TEXTINPUT: 'text_input',

  ONE_LINE_OVERFLOW_TEXT: 'one_line_overflow_text',
})

function createState(type) {
  switch (type) {
    case Type.TEXT:
      return lodash.cloneDeep(Text.initialState);
    case Type.BUTTON:
      return lodash.cloneDeep(Button.initialState);
    case Type.TABLE:
      return lodash.cloneDeep(Table.initialState);
    case Type.TEXTINPUT:
      return lodash.cloneDeep(TextInput.initialState);
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
      return Button.getExportedState;
    case Type.TABLE:
      return Table.getExportedState;
    case Type.TEXTINPUT:
      return TextInput.getExportedState;
    default:
      throw new Error(`in getExporter: unexpected widget type: ${type}`);
  }
}

function getRawExportedState(type) {
  switch (type) {
    case Type.TEXT:
      return Text.getRawExportedState;
    case Type.BUTTON:
      return Button.getRawExportedState;
    case Type.TABLE:
      return Table.getRawExportedState;
    case Type.TEXTINPUT:
      return TextInput.getRawExportedState;
    default:
      throw new Error(`in getExporter: unexpected widget type: ${type}`);
  }
}

function getToEvalTemplates(type) {
  switch (type) {
    case Type.TEXT:
      return Text.getToEvalTemplates;
    case Type.BUTTON:
      return Button.getToEvalTemplates;
    case Type.TABLE:
      return Table.getToEvalTemplates;
    case Type.TEXTINPUT:
      return TextInput.getToEvalTemplates;
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
WidgetFactory.getRawExportedState = getRawExportedState;
WidgetFactory.getToEvalTemplates = getToEvalTemplates;

export default WidgetFactory;