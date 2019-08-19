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
      return lodash.cloneDeep(Text.initialState);
    case Type.BUTTON:
      return lodash.cloneDeep(Button.initialState);
    case Type.TABLE:
      return lodash.cloneDeep(Table.initialState);
    case Type.TEXTINPUT:
      return lodash.cloneDeep(TextInput.initialState);
    default:
      throw new Error(`unexpected widget type: ${type}`);
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
      throw new Error(`unexpected widget type: ${type}`);
  }
}

const WidgetFactory = {};
WidgetFactory.Type = Type;
WidgetFactory.createState = createState;
WidgetFactory.createElement = createElement;

export default WidgetFactory;