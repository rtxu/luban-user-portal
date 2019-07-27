import PropTypes from 'prop-types';

// NOTICE: `Type` must be a unique description string, when drop it will be used to generate widgetId(= type + instanceId)
export const Type = {
  TEXT: 'text',
  BUTTON: 'button',
  TABLE: 'table',
  TEXTINPUT: 'text_input',

  ONE_LINE_OVERFLOW_TEXT: 'one_line_overflow_text',
}

/*
function create(type) {
  switch (type) {
    case Type.TEXT:
      return 

  }
}
*/

function Widget({type}) {
  // const widget = create(type);
  return {widget};
}

Widget.propTypes = {
  type: PropTypes.string.isRequired,
}

Widget.Type = Type;

export default Widget;